package articles

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"path"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	errorx "github.com/computeflux-xyz/agency/services/site-api/application/error"
	"github.com/computeflux-xyz/agency/services/site-api/models"
)

// IngestConfig carries the storage-key and presign settings the ingest use case
// needs to turn declared files into R2 keys, public URLs and upload tickets.
type IngestConfig struct {
	KeyPrefix  string        // optional prefix prepended to every key (shared buckets)
	PresignTTL time.Duration // lifetime of a presigned PUT URL
}

// IngestUseCase implements the admin publish pipeline (begin/commit/delete).
type IngestUseCase struct {
	store contracts.ArticleWriteStorage
	blobs contracts.BlobStore
	cfg   IngestConfig
}

func NewIngestUseCase(store contracts.ArticleWriteStorage, blobs contracts.BlobStore, cfg IngestConfig) *IngestUseCase {
	if cfg.PresignTTL <= 0 {
		cfg.PresignTTL = 30 * time.Minute
	}
	return &IngestUseCase{store: store, blobs: blobs, cfg: cfg}
}

var slugPattern = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

// Begin validates the submission, computes the version prefix + manifest,
// persists a draft version, and returns presigned PUT URLs for the blobs that
// still need uploading. If the exact build is already published it short-
// circuits with AlreadyPublished.
func (uc *IngestUseCase) Begin(ctx context.Context, req contracts.IngestBeginRequest) (contracts.IngestBeginResponse, error) {
	var resp contracts.IngestBeginResponse

	if err := validateBegin(req); err != nil {
		return resp, err
	}

	checksum := manifestChecksum(req.Files)

	if existing, err := uc.store.FindCommittedVersionByChecksum(ctx, req.Slug, checksum); err != nil {
		return resp, err
	} else if existing != nil {
		return contracts.IngestBeginResponse{
			AlreadyPublished: true,
			VersionID:        existing.ID,
			Version:          existing.Version,
			R2Prefix:         existing.R2Prefix,
			BaseURL:          existing.Manifest.BaseURL,
			Entrypoint:       existing.Entrypoint,
		}, nil
	}

	version, err := uc.store.NextVersion(ctx, req.Slug)
	if err != nil {
		return resp, err
	}

	prefix := uc.versionPrefix(req.Type, req.Slug, version)
	entrypoint := resolveEntrypoint(req.Files)

	manifest := models.Manifest{
		Entrypoint: entrypoint,
		BasePrefix: prefix,
		BaseURL:    strings.TrimSuffix(uc.blobs.PublicURL(prefix), "/"),
	}

	var (
		uploads   []contracts.IngestUpload
		skipped   []string
		totalSize int64
		coverURL  string
	)

	for _, f := range req.Files {
		key := path.Join(prefix, f.Path)
		url := uc.blobs.PublicURL(key)
		isEntry := f.Path == entrypoint

		manifest.Files = append(manifest.Files, models.ManifestFile{
			Path:         f.Path,
			Key:          key,
			URL:          url,
			ContentType:  f.ContentType,
			ByteSize:     f.ByteSize,
			SHA256:       f.SHA256,
			Kind:         assetKindForPath(f.Path, isEntry),
			IsEntrypoint: isEntry,
		})
		totalSize += f.ByteSize
		if req.CoverPath != "" && f.Path == req.CoverPath {
			coverURL = url
		}

		exists, err := uc.blobs.ObjectExists(ctx, key)
		if err != nil {
			return resp, errorx.NewExternal(errorx.CodeExternalService, "storage unavailable", err)
		}

		if exists {
			skipped = append(skipped, f.Path)
			continue
		}

		putURL, err := uc.blobs.PresignPut(ctx, key, f.ContentType, uc.cfg.PresignTTL)
		if err != nil {
			return resp, errorx.NewExternal(errorx.CodeExternalService, "could not presign upload", err)
		}

		uploads = append(uploads, contracts.IngestUpload{
			Path: f.Path, Key: key, URL: url, PutURL: putURL, ContentType: f.ContentType,
		})
	}

	article := &models.Article{
		Slug:           req.Slug,
		Type:           req.Type,
		Title:          req.Title,
		ShortDesc:      req.ShortDesc,
		LongDesc:       req.LongDesc,
		Featured:       req.Featured,
		ReadingMinutes: req.ReadingMinutes,
		CoverImageURL:  coverURL,
		SEOTitle:       req.SEOTitle,
		SEODescription: req.SEODescription,
		CanonicalURL:   req.CanonicalURL,
		SourceDir:      req.SourceDir,
	}
	ver := &models.ArticleVersion{
		Version:     version,
		R2Prefix:    prefix,
		Entrypoint:  entrypoint,
		Manifest:    manifest,
		BuildCommit: req.SourceCommit,
		BuildRef:    req.SourceRef,
		Checksum:    checksum,
		ByteSize:    totalSize,
		FileCount:   len(req.Files),
	}

	versionID, jobID, err := uc.store.BeginIngest(ctx, article, ver, req.Topics, req.Authors, contracts.IngestJobInput{
		SourceCommit:     req.SourceCommit,
		SourceRef:        req.SourceRef,
		ManifestChecksum: checksum,
		RequestedBy:      req.RequestedBy,
	})
	if err != nil {
		return resp, err
	}

	return contracts.IngestBeginResponse{
		VersionID:  versionID,
		JobID:      jobID,
		Version:    version,
		R2Prefix:   prefix,
		BaseURL:    manifest.BaseURL,
		Entrypoint: entrypoint,
		Uploads:    uploads,
		Skipped:    skipped,
	}, nil
}

// Commit verifies every declared blob was uploaded, then atomically publishes
// the version (assets + manifest + live pointer flip).
func (uc *IngestUseCase) Commit(ctx context.Context, req contracts.IngestCommitRequest) (*models.Article, error) {
	if strings.TrimSpace(req.VersionID) == "" {
		return nil, errorx.NewBadRequest("version_id is required")
	}

	ver, _, err := uc.store.GetDraftVersion(ctx, req.VersionID)
	if err != nil {
		return nil, err
	}

	var missing []string
	for _, f := range ver.Manifest.Files {
		exists, err := uc.blobs.ObjectExists(ctx, f.Key)
		if err != nil {
			_ = uc.store.FailIngest(ctx, req.JobID, "storage check failed: "+err.Error())
			return nil, errorx.NewExternal(errorx.CodeExternalService, "storage unavailable", err)
		}

		if !exists {
			missing = append(missing, f.Path)
		}
	}

	if len(missing) > 0 {
		reason := fmt.Sprintf("%d blob(s) not uploaded: %s", len(missing), strings.Join(truncate(missing, 10), ", "))
		_ = uc.store.FailIngest(ctx, req.JobID, reason)
		return nil, errorx.NewBadRequest("upload incomplete: %s", reason)
	}

	assets := make([]models.ArticleAsset, len(ver.Manifest.Files))
	for i, f := range ver.Manifest.Files {
		assets[i] = models.ArticleAsset{
			Path:         f.Path,
			R2Key:        f.Key,
			ContentType:  f.ContentType,
			ByteSize:     f.ByteSize,
			SHA256:       f.SHA256,
			Kind:         f.Kind,
			IsEntrypoint: f.IsEntrypoint,
		}
	}

	return uc.store.CommitIngest(ctx, req.VersionID, req.JobID, assets, ver.Manifest)
}

// Delete removes an article's metadata and purges its blobs from storage.
func (uc *IngestUseCase) Delete(ctx context.Context, slug string) error {
	prefixes, err := uc.store.DeleteArticle(ctx, slug)
	if err != nil {
		return err
	}

	for _, p := range prefixes {
		if p == "" {
			continue
		}

		if err := uc.blobs.DeletePrefix(ctx, p); err != nil {
			return errorx.NewExternal(errorx.CodeExternalService, "article deleted but blob cleanup failed", err)
		}
	}

	return nil
}

// versionPrefix builds the immutable R2 key prefix for one build:
//
//	[<keyPrefix>/]articles/<type>/<slug>/v<version>/
func (uc *IngestUseCase) versionPrefix(t models.ArticleType, slug string, version int) string {
	parts := []string{}
	if uc.cfg.KeyPrefix != "" {
		parts = append(parts, strings.Trim(uc.cfg.KeyPrefix, "/"))
	}

	parts = append(parts, "articles", string(t), slug, fmt.Sprintf("v%d", version))
	return path.Join(parts...) + "/"
}

func validateBegin(req contracts.IngestBeginRequest) error {
	fields := map[string]string{}
	if !slugPattern.MatchString(req.Slug) {
		fields["slug"] = "must be a lowercase kebab-case slug"
	}

	if !req.Type.Valid() {
		fields["type"] = "must be 'blog' or 'study'"
	}

	if strings.TrimSpace(req.Title) == "" {
		fields["title"] = "is required"
	}

	if len(req.Files) == 0 {
		fields["files"] = "at least one file is required"
	}

	for i, f := range req.Files {
		if f.Path == "" || strings.HasPrefix(f.Path, "/") || strings.Contains(f.Path, "..") {
			fields[fmt.Sprintf("files[%d].path", i)] = "must be a clean relative path"
		}

		if len(f.SHA256) != 64 {
			fields[fmt.Sprintf("files[%d].sha256", i)] = "must be a hex sha256"
		}
	}

	if resolveEntrypoint(req.Files) == "" {
		fields["entrypoint"] = "no index.html or flagged entrypoint found"
	}

	if len(fields) > 0 {
		return errorx.NewValidation("invalid ingest request", fields)
	}

	return nil
}

// resolveEntrypoint returns the entry document path: a file explicitly flagged,
// else a root-level index.html, else "".
func resolveEntrypoint(files []contracts.IngestFileSpec) string {
	for _, f := range files {
		if f.IsEntrypoint {
			return f.Path
		}
	}

	for _, f := range files {
		if f.Path == "index.html" {
			return f.Path
		}
	}

	return ""
}

// assetKindForPath classifies a built file by its dist/ location.
func assetKindForPath(p string, isEntry bool) models.AssetKind {
	switch {
	case isEntry:
		return models.AssetKindEntry
	case strings.HasPrefix(p, "_observablehq/"):
		return models.AssetKindRuntime
	case strings.HasPrefix(p, "_npm/"):
		return models.AssetKindNpm
	case strings.HasPrefix(p, "_import/"):
		return models.AssetKindImport
	case strings.HasPrefix(p, "_file/"):
		return models.AssetKindFile
	case strings.HasSuffix(p, ".html"):
		return models.AssetKindEntry
	default:
		return models.AssetKindOther
	}
}

// manifestChecksum is a stable digest of the (path, sha256) set. The identity
// of a build, used for idempotent re-publishes.
func manifestChecksum(files []contracts.IngestFileSpec) string {
	lines := make([]string, len(files))
	for i, f := range files {
		lines[i] = f.Path + ":" + f.SHA256
	}

	sort.Strings(lines)
	sum := sha256.Sum256([]byte(strings.Join(lines, "\n")))
	return hex.EncodeToString(sum[:])
}

func truncate(s []string, n int) []string {
	if len(s) <= n {
		return s
	}

	return append(s[:n:n], fmt.Sprintf("(+%d more)", len(s)-n))
}
