// Command article-publisher builds are already produced upstream. This tool
// takes an article source directory that contains an `article.json` and a built
// `dist/` tree, and publishes it to site-api via the presigned-URL ingest flow:
//
//	begin  -> receive presigned PUT URLs for missing blobs (dedup by sha256)
//	upload -> PUT each blob straight to R2 (no R2 credentials needed here)
//	commit -> site-api verifies + atomically publishes the version
//
// It is invoked by the publish GitHub Action after `npm run build`, and is also
// runnable locally against the docker-compose stack.
package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type articleMeta struct {
	Slug           string   `json:"slug"`
	Type           string   `json:"type"`
	Title          string   `json:"title"`
	ShortDesc      string   `json:"shortdesc"`
	LongDesc       string   `json:"longdesc"`
	Topics         []string `json:"topics"`
	Authors        []string `json:"authors"`
	Featured       bool     `json:"featured"`
	ReadingMinutes int      `json:"readingMinutes"`
	SEOTitle       string   `json:"seoTitle"`
	SEODescription string   `json:"seoDescription"`
	CanonicalURL   string   `json:"canonicalUrl"`
	Cover          string   `json:"cover"`
}

type fileSpec struct {
	Path         string `json:"path"`
	SHA256       string `json:"sha256"`
	ByteSize     int64  `json:"byteSize"`
	ContentType  string `json:"contentType"`
	IsEntrypoint bool   `json:"isEntrypoint"`
}

type beginRequest struct {
	Slug           string     `json:"slug"`
	Type           string     `json:"type"`
	Title          string     `json:"title"`
	ShortDesc      string     `json:"shortdesc"`
	LongDesc       string     `json:"longdesc"`
	Topics         []string   `json:"topics"`
	Authors        []string   `json:"authors"`
	Featured       bool       `json:"featured"`
	ReadingMinutes int        `json:"readingMinutes"`
	SEOTitle       string     `json:"seoTitle"`
	SEODescription string     `json:"seoDescription"`
	CanonicalURL   string     `json:"canonicalUrl"`
	CoverPath      string     `json:"coverPath"`
	SourceDir      string     `json:"sourceDir"`
	SourceCommit   string     `json:"sourceCommit"`
	SourceRef      string     `json:"sourceRef"`
	Files          []fileSpec `json:"files"`
}

type upload struct {
	Path        string `json:"path"`
	Key         string `json:"key"`
	URL         string `json:"url"`
	PutURL      string `json:"putUrl"`
	ContentType string `json:"contentType"`
}

type beginResponse struct {
	AlreadyPublished bool     `json:"alreadyPublished"`
	VersionID        string   `json:"versionId"`
	JobID            string   `json:"jobId"`
	Version          int      `json:"version"`
	BaseURL          string   `json:"baseUrl"`
	Entrypoint       string   `json:"entrypoint"`
	Uploads          []upload `json:"uploads"`
	Skipped          []string `json:"skipped"`
}

func main() {
	var (
		dir        = flag.String("dir", "", "article source directory (contains article.json and dist/)")
		distDir    = flag.String("dist", "", "override path to the built dist/ dir (default <dir>/dist)")
		apiBase    = flag.String("api", envOr("API_BASE_URL", "http://localhost:8080"), "site-api base URL")
		token      = flag.String("token", os.Getenv("INGEST_TOKEN"), "admin ingest bearer token")
		actor      = flag.String("actor", envOr("GITHUB_ACTOR", "local"), "who requested the publish")
		commit     = flag.String("commit", os.Getenv("GITHUB_SHA"), "source git commit")
		ref        = flag.String("ref", os.Getenv("GITHUB_REF_NAME"), "source git ref")
		deleteSlug = flag.String("delete", "", "delete a single article by slug, then exit")
		prune      = flag.Bool("prune", false, "delete every remote article whose slug is not in -keep, then exit")
		keep       = flag.String("keep", "", "comma-separated slugs to keep (the full local set); required with -prune")
	)
	flag.Parse()

	if *token == "" {
		fmt.Fprintln(os.Stderr, "usage: article-publisher -token <ingest-token> [ -dir <dir> | -delete <slug> | -prune -keep <csv> ] [-api URL]")
		os.Exit(2)
	}

	client := &http.Client{Timeout: 60 * time.Second}

	// Deletion modes exit early; the default mode publishes one article dir.
	switch {
	case *deleteSlug != "":
		if err := doDelete(client, *apiBase, *token, *actor, *deleteSlug); err != nil {
			fmt.Fprintf(os.Stderr, "delete failed: %v\n", err)
			os.Exit(1)
		}
		return
	case *prune:
		if err := doPrune(client, *apiBase, *token, *actor, *keep); err != nil {
			fmt.Fprintf(os.Stderr, "prune failed: %v\n", err)
			os.Exit(1)
		}
		return
	}

	if *dir == "" {
		fmt.Fprintln(os.Stderr, "usage: article-publisher -dir <article-dir> -token <ingest-token> [-api URL]")
		os.Exit(2)
	}

	if *distDir == "" {
		*distDir = filepath.Join(*dir, "dist")
	}

	if err := run(*dir, *distDir, *apiBase, *token, *actor, *commit, *ref); err != nil {
		fmt.Fprintf(os.Stderr, "publish failed: %v\n", err)
		os.Exit(1)
	}
}

func run(dir, distDir, apiBase, token, actor, commit, ref string) error {
	meta, err := readMeta(filepath.Join(dir, "article.json"))
	if err != nil {
		return err
	}

	files, err := walkDist(distDir)
	if err != nil {
		return err
	}

	if len(files) == 0 {
		return fmt.Errorf("no files found under %s (did the build run?)", distDir)
	}

	coverPath := resolveCover(meta.Cover, files)
	req := beginRequest{
		Slug:           meta.Slug,
		Type:           meta.Type,
		Title:          meta.Title,
		ShortDesc:      meta.ShortDesc,
		LongDesc:       meta.LongDesc,
		Topics:         meta.Topics,
		Authors:        meta.Authors,
		Featured:       meta.Featured,
		ReadingMinutes: meta.ReadingMinutes,
		SEOTitle:       meta.SEOTitle,
		SEODescription: meta.SEODescription,
		CanonicalURL:   meta.CanonicalURL,
		CoverPath:      coverPath,
		SourceDir:      filepath.Base(dir),
		SourceCommit:   commit,
		SourceRef:      ref,
		Files:          files,
	}

	client := &http.Client{Timeout: 60 * time.Second}

	fmt.Printf("→ begin: %s (%s), %d files\n", meta.Slug, meta.Type, len(files))
	begin, err := doBegin(client, apiBase, token, actor, req)
	if err != nil {
		return err
	}

	if begin.AlreadyPublished {
		fmt.Printf("✓ already published (version %d); nothing to upload\n", begin.Version)
		return nil
	}

	fmt.Printf("  version %d, %d to upload, %d skipped\n", begin.Version, len(begin.Uploads), len(begin.Skipped))
	for _, u := range begin.Uploads {
		if err := putBlob(client, distDir, u); err != nil {
			return fmt.Errorf("upload %s: %w", u.Path, err)
		}
	}

	fmt.Printf("  uploaded %d blobs\n", len(begin.Uploads))
	if err := doCommit(client, apiBase, token, actor, begin.VersionID, begin.JobID); err != nil {
		return err
	}

	fmt.Printf("✓ published %s → %s%s\n", meta.Slug, strings.TrimSuffix(begin.BaseURL, "/")+"/", begin.Entrypoint)
	return nil
}

func readMeta(path string) (articleMeta, error) {
	var m articleMeta
	b, err := os.ReadFile(path)
	if err != nil {
		return m, fmt.Errorf("read article.json: %w", err)
	}

	if err := json.Unmarshal(b, &m); err != nil {
		return m, fmt.Errorf("parse article.json: %w", err)
	}

	if m.Slug == "" || m.Type == "" || m.Title == "" {
		return m, fmt.Errorf("article.json must set slug, type and title")
	}

	return m, nil
}

// walkDist enumerates every file under distDir, computing its relative path,
// sha256, size and content type. index.html at the root is flagged entrypoint.
func walkDist(distDir string) ([]fileSpec, error) {
	var files []fileSpec
	err := filepath.WalkDir(distDir, func(p string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}

		rel, err := filepath.Rel(distDir, p)
		if err != nil {
			return err
		}

		rel = filepath.ToSlash(rel)
		sum, size, err := hashFile(p)
		if err != nil {
			return err
		}

		files = append(files, fileSpec{
			Path:         rel,
			SHA256:       sum,
			ByteSize:     size,
			ContentType:  contentType(rel),
			IsEntrypoint: rel == "index.html",
		})

		return nil
	})
	if err != nil {
		return nil, err
	}

	sort.Slice(files, func(i, j int) bool { return files[i].Path < files[j].Path })
	return files, nil
}

func hashFile(path string) (string, int64, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", 0, err
	}

	defer f.Close()
	h := sha256.New()
	n, err := io.Copy(h, f)
	if err != nil {
		return "", 0, err
	}

	return hex.EncodeToString(h.Sum(nil)), n, nil
}

// resolveCover matches the article's cover (a basename like "cover.png") to its
// content-hashed built path (e.g. "_file/cover.a1b2c3.png"), or returns the
// value unchanged if it already points at an existing dist file.
func resolveCover(cover string, files []fileSpec) string {
	if cover == "" {
		return ""
	}

	cover = filepath.ToSlash(cover)
	for _, f := range files {
		if f.Path == cover {
			return cover
		}
	}

	stem := strings.TrimSuffix(filepath.Base(cover), filepath.Ext(cover))
	ext := filepath.Ext(cover)
	for _, f := range files {
		base := filepath.Base(f.Path)
		if strings.HasPrefix(base, stem+".") && strings.HasSuffix(base, ext) {
			return f.Path
		}
	}

	return ""
}

func doBegin(client *http.Client, apiBase, token, actor string, req beginRequest) (*beginResponse, error) {
	body, _ := json.Marshal(req)
	httpReq, err := http.NewRequest(http.MethodPost, strings.TrimRight(apiBase, "/")+"/api/admin/articles/ingest/begin", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+token)
	httpReq.Header.Set("X-Ingest-Actor", actor)

	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, apiError("begin", resp)
	}

	var out beginResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, err
	}

	return &out, nil
}

func putBlob(client *http.Client, distDir string, u upload) error {
	f, err := os.Open(filepath.Join(distDir, filepath.FromSlash(u.Path)))
	if err != nil {
		return err
	}

	defer f.Close()
	info, err := f.Stat()
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPut, u.PutURL, f)
	if err != nil {
		return err
	}

	req.ContentLength = info.Size()
	req.Header.Set("Content-Type", u.ContentType)

	resp, err := client.Do(req)
	if err != nil {
		return err
	}

	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))
		return fmt.Errorf("PUT %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))
	}

	return nil
}

func doCommit(client *http.Client, apiBase, token, actor, versionID, jobID string) error {
	body, _ := json.Marshal(map[string]string{"versionId": versionID, "jobId": jobID})
	req, err := http.NewRequest(http.MethodPost, strings.TrimRight(apiBase, "/")+"/api/admin/articles/ingest/commit", bytes.NewReader(body))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("X-Ingest-Actor", actor)

	resp, err := client.Do(req)
	if err != nil {
		return err
	}

	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return apiError("commit", resp)
	}

	return nil
}

func apiError(step string, resp *http.Response) error {
	b, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
	return fmt.Errorf("%s returned %d: %s", step, resp.StatusCode, strings.TrimSpace(string(b)))
}

// doDelete removes a single article by slug. A 404 is treated as success so the
// operation is idempotent.
func doDelete(client *http.Client, apiBase, token, actor, slug string) error {
	req, err := http.NewRequest(http.MethodDelete, strings.TrimRight(apiBase, "/")+"/api/admin/articles/"+url.PathEscape(slug), nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("X-Ingest-Actor", actor)

	resp, err := client.Do(req)
	if err != nil {
		return err
	}

	defer resp.Body.Close()
	if resp.StatusCode == http.StatusNotFound {
		fmt.Printf("· %s already absent\n", slug)
		return nil
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return apiError("delete "+slug, resp)
	}

	fmt.Printf("✗ deleted %s\n", slug)
	return nil
}

// listRemoteSlugs pages through GET /api/articles (all types) and returns every
// published slug.
func listRemoteSlugs(client *http.Client, apiBase string) ([]string, error) {
	var slugs []string
	for page := 1; ; page++ {
		u := fmt.Sprintf("%s/api/articles?pageSize=100&page=%d", strings.TrimRight(apiBase, "/"), page)
		resp, err := client.Get(u)
		if err != nil {
			return nil, err
		}

		if resp.StatusCode != http.StatusOK {
			defer resp.Body.Close()
			return nil, apiError("list", resp)
		}

		var out struct {
			Items []struct {
				Slug string `json:"slug"`
			} `json:"items"`
			Total int64 `json:"total"`
		}
		err = json.NewDecoder(resp.Body).Decode(&out)
		resp.Body.Close()
		if err != nil {
			return nil, err
		}

		for _, it := range out.Items {
			slugs = append(slugs, it.Slug)
		}

		if len(out.Items) == 0 || int64(len(slugs)) >= out.Total {
			return slugs, nil
		}
	}
}

// doPrune deletes remote articles whose slug is not in keepCSV (the full local
// set). It refuses to run on an empty keep list to avoid wiping every article.
func doPrune(client *http.Client, apiBase, token, actor, keepCSV string) error {
	keep := map[string]bool{}
	for _, s := range strings.Split(keepCSV, ",") {
		if s = strings.TrimSpace(s); s != "" {
			keep[s] = true
		}
	}

	if len(keep) == 0 {
		return fmt.Errorf("-keep is empty; refusing to prune (would delete every article)")
	}

	remote, err := listRemoteSlugs(client, apiBase)
	if err != nil {
		return err
	}

	var orphans []string
	for _, s := range remote {
		if !keep[s] {
			orphans = append(orphans, s)
		}
	}

	fmt.Printf("prune: %d remote, %d kept, %d to delete\n", len(remote), len(keep), len(orphans))
	for _, s := range orphans {
		if err := doDelete(client, apiBase, token, actor, s); err != nil {
			return err
		}
	}

	return nil
}

// contentType returns a deterministic MIME type for a built asset by extension,
// since object storage does not infer it.
func contentType(rel string) string {
	ext := strings.ToLower(filepath.Ext(rel))
	switch ext {
	case ".html", ".htm":
		return "text/html; charset=utf-8"
	case ".js", ".mjs":
		return "text/javascript; charset=utf-8"
	case ".css":
		return "text/css; charset=utf-8"
	case ".json", ".map":
		return "application/json; charset=utf-8"
	case ".svg":
		return "image/svg+xml"
	case ".csv":
		return "text/csv; charset=utf-8"
	case ".woff2":
		return "font/woff2"
	case ".woff":
		return "font/woff"
	case ".wasm":
		return "application/wasm"
	}

	if t := mime.TypeByExtension(ext); t != "" {
		return t
	}

	return "application/octet-stream"
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}

	return fallback
}
