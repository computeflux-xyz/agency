package whitepapers

import (
	"context"
	"fmt"
	"path"
	"regexp"
	"strings"
	"time"

	"github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	errorx "github.com/computeflux-xyz/agency/services/site-api/application/error"
	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type IngestConfig struct {
	KeyPrefix  string
	PresignTTL time.Duration
}

type IngestUseCase struct {
	store contracts.WhitePaperWriteStorage
	blobs contracts.BlobStore
	cfg   IngestConfig
}

func NewIngestUseCase(store contracts.WhitePaperWriteStorage, blobs contracts.BlobStore, cfg IngestConfig) *IngestUseCase {
	if cfg.PresignTTL <= 0 {
		cfg.PresignTTL = 30 * time.Minute
	}

	return &IngestUseCase{store: store, blobs: blobs, cfg: cfg}
}

var slugPattern = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

func (uc *IngestUseCase) Begin(ctx context.Context, req contracts.WhitePaperIngestRequest) (contracts.WhitePaperIngestResponse, error) {
	var resp contracts.WhitePaperIngestResponse

	if err := validateIngest(req); err != nil {
		return resp, err
	}

	paper := &models.WhitePaper{
		Slug:      req.Slug,
		Status:    models.WhitePaperStatusDraft,
		Featured:  req.Featured,
		Topics:    req.Topics,
		SourceDir: req.SourceDir,
	}

	if req.PublishDate != "" {
		d, err := time.Parse("2006-01-02", req.PublishDate)
		if err != nil {
			return resp, errorx.NewValidation("invalid whitepaper", map[string]string{
				"publishDate": "must be YYYY-MM-DD",
			})
		}

		paper.PublishDate = &d
	}

	for _, spec := range req.Locales {
		paper.Locales = append(paper.Locales, models.WhitePaperLocale{
			Lang:      spec.Lang,
			Title:     spec.Title,
			ShortDesc: spec.ShortDesc,
			LongDesc:  spec.LongDesc,
			Pages:     spec.Pages,
			Filename:  spec.Filename,
			R2Key:     uc.objectKey(req.Slug, spec),
			SHA256:    spec.SHA256,
			ByteSize:  spec.ByteSize,
		})
	}

	if _, err := uc.store.UpsertWhitePaper(ctx, paper); err != nil {
		return resp, err
	}

	resp.Slug = req.Slug
	for _, loc := range paper.Locales {
		exists, err := uc.blobs.ObjectExists(ctx, loc.R2Key)
		if err != nil {
			return resp, errorx.NewExternal(errorx.CodeExternalService, "storage unavailable", err)
		}

		if exists {
			resp.Skipped = append(resp.Skipped, string(loc.Lang))
			continue
		}

		putURL, err := uc.blobs.PresignPut(ctx, loc.R2Key, "application/pdf", uc.cfg.PresignTTL)
		if err != nil {
			return resp, errorx.NewExternal(errorx.CodeExternalService, "could not presign upload", err)
		}

		resp.Uploads = append(resp.Uploads, contracts.WhitePaperUpload{
			Lang: loc.Lang, Key: loc.R2Key, PutURL: putURL,
		})
	}

	return resp, nil
}

func (uc *IngestUseCase) Commit(ctx context.Context, slug string) (*models.WhitePaper, error) {
	if !slugPattern.MatchString(slug) {
		return nil, errorx.NewBadRequest("slug must be a lowercase kebab-case slug")
	}

	paper, err := uc.store.GetDraft(ctx, slug)
	if err != nil {
		return nil, err
	}

	var (
		missing []string
		langs   []models.Lang
	)

	for _, loc := range paper.Locales {
		exists, err := uc.blobs.ObjectExists(ctx, loc.R2Key)
		if err != nil {
			return nil, errorx.NewExternal(errorx.CodeExternalService, "storage unavailable", err)
		}

		if !exists {
			missing = append(missing, string(loc.Lang))
			continue
		}

		langs = append(langs, loc.Lang)
	}

	if len(missing) > 0 {
		return nil, errorx.NewBadRequest("upload incomplete: no PDF for %s", strings.Join(missing, ", "))
	}

	return uc.store.PublishWhitePaper(ctx, slug, langs)
}

func (uc *IngestUseCase) Delete(ctx context.Context, slug string) error {
	keys, err := uc.store.DeleteWhitePaper(ctx, slug)
	if err != nil {
		return err
	}

	for _, k := range keys {
		if k == "" {
			continue
		}

		if err := uc.blobs.DeletePrefix(ctx, k); err != nil {
			return errorx.NewExternal(errorx.CodeExternalService, "whitepaper deleted but blob cleanup failed", err)
		}
	}

	return nil
}

// objectKey builds the private, content-addressed key of one edition:
//
//	[<keyPrefix>/]whitepapers/<slug>/<lang>/<sha256>.pdf
func (uc *IngestUseCase) objectKey(slug string, spec contracts.WhitePaperLocaleSpec) string {
	parts := []string{}
	if uc.cfg.KeyPrefix != "" {
		parts = append(parts, strings.Trim(uc.cfg.KeyPrefix, "/"))
	}

	parts = append(parts, "whitepapers", slug, string(spec.Lang), spec.SHA256+".pdf")
	return path.Join(parts...)
}

func validateIngest(req contracts.WhitePaperIngestRequest) error {
	fields := map[string]string{}
	if !slugPattern.MatchString(req.Slug) {
		fields["slug"] = "must be a lowercase kebab-case slug"
	}

	if len(req.Locales) == 0 {
		fields["locales"] = "at least one language edition is required"
	}

	seen := map[models.Lang]bool{}
	for i, loc := range req.Locales {
		key := fmt.Sprintf("locales[%d]", i)
		if !loc.Lang.Valid() {
			fields[key+".lang"] = "unsupported language"
		}

		if seen[loc.Lang] {
			fields[key+".lang"] = "duplicate language"
		}

		seen[loc.Lang] = true

		if strings.TrimSpace(loc.Title) == "" {
			fields[key+".title"] = "is required"
		}

		if len(loc.SHA256) != 64 {
			fields[key+".sha256"] = "must be a hex sha256"
		}

		if loc.Filename == "" || strings.ContainsAny(loc.Filename, "/\\") || strings.Contains(loc.Filename, "..") {
			fields[key+".filename"] = "must be a bare file name"
		}

		if loc.ByteSize <= 0 {
			fields[key+".byteSize"] = "must be greater than 0"
		}
	}

	if len(fields) > 0 {
		return errorx.NewValidation("invalid whitepaper ingest request", fields)
	}

	return nil
}
