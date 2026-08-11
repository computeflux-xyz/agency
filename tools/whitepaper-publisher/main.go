// whitepaper-publisher publishes the PDFs built by tools/whitepaper to site-api.
//
//	begin  -> declare the publication, receive a presigned PUT per edition whose
//	          PDF is not already stored (dedup by sha256)
//	upload  -> PUT each PDF straight to object storage
//	commit -> publish the whitepaper once every edition is in place
//
// Input is the manifest.json written next to the PDFs by
// `tools/whitepaper/generate.py`, so the build and the publish never disagree
// about titles, languages or page counts.
package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// manifest mirrors tools/whitepaper/engine/paper.py
type manifest struct {
	Slug        string   `json:"slug"`
	Type        string   `json:"type"`
	Topics      []string `json:"topics"`
	Authors     []string `json:"authors"`
	Featured    bool     `json:"featured"`
	Cover       string   `json:"cover"`
	PublishDate string   `json:"publishDate"`
	Locales     map[string]struct {
		Entry     string `json:"entry"`
		Title     string `json:"title"`
		Shortdesc string `json:"shortdesc"`
		Longdesc  string `json:"longdesc"`
		Pages     int    `json:"pages"`
	} `json:"locales"`
}

type localeSpec struct {
	Lang      string `json:"lang"`
	Title     string `json:"title"`
	Shortdesc string `json:"shortdesc"`
	Longdesc  string `json:"longdesc"`
	Pages     int    `json:"pages"`
	Filename  string `json:"filename"`
	SHA256    string `json:"sha256"`
	ByteSize  int64  `json:"byteSize"`

	path string
}

type beginRequest struct {
	Slug        string       `json:"slug"`
	Topics      []string     `json:"topics"`
	Featured    bool         `json:"featured"`
	PublishDate string       `json:"publishDate,omitempty"`
	SourceDir   string       `json:"sourceDir,omitempty"`
	RequestedBy string       `json:"requestedBy,omitempty"`
	Locales     []localeSpec `json:"locales"`
}

type beginResponse struct {
	Slug    string   `json:"slug"`
	Skipped []string `json:"skipped"`
	Uploads []struct {
		Lang   string `json:"lang"`
		Key    string `json:"key"`
		PutURL string `json:"putUrl"`
	} `json:"uploads"`
}

func main() {
	var (
		dir        = flag.String("dir", "", "directory holding manifest.json and the PDFs (e.g. tools/whitepaper/out/<slug>)")
		root       = flag.String("root", "tools/whitepaper/out", "root walked by -list and -all")
		apiBase    = flag.String("api", envOr("API_BASE_URL", "http://localhost:8080"), "site-api base URL")
		token      = flag.String("token", os.Getenv("INGEST_TOKEN"), "admin ingest bearer token")
		actor      = flag.String("actor", envOr("GITHUB_ACTOR", "local"), "who requested the publish")
		list       = flag.Bool("list", false, "print every publishable directory under -root, one per line, then exit")
		all        = flag.Bool("all", false, "publish every directory under -root")
		deleteSlug = flag.String("delete", "", "delete one whitepaper by slug, then exit")
	)
	flag.Parse()

	switch {
	case *list:
		dirs, err := discover(*root)
		exitOn(err)
		for _, d := range dirs {
			fmt.Println(d)
		}

		return
	case *deleteSlug != "":
		exitOn(requireAPI(*apiBase, *token))
		exitOn(deleteWhitePaper(*apiBase, *token, *deleteSlug))
		fmt.Printf("deleted %s\n", *deleteSlug)

		return
	}

	exitOn(requireAPI(*apiBase, *token))

	targets := []string{*dir}
	if *all {
		dirs, err := discover(*root)
		exitOn(err)
		targets = dirs
	}

	if len(targets) == 0 || targets[0] == "" {
		exitOn(fmt.Errorf("either -dir or -all is required"))
	}

	for _, target := range targets {
		exitOn(publish(target, *apiBase, *token, *actor))
	}
}

func discover(root string) ([]string, error) {
	entries, err := os.ReadDir(root)
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", root, err)
	}

	var out []string
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}

		dir := filepath.Join(root, e.Name())
		if _, err := os.Stat(filepath.Join(dir, "manifest.json")); err == nil {
			out = append(out, dir)
		}
	}

	sort.Strings(out)
	return out, nil
}

func publish(dir, apiBase, token, actor string) error {
	man, err := readManifest(dir)
	if err != nil {
		return err
	}

	if man.Type != "" && man.Type != "whitepaper" {
		return fmt.Errorf("%s: manifest type is %q, expected \"whitepaper\"", dir, man.Type)
	}

	locales, err := collectLocales(dir, man)
	if err != nil {
		return err
	}

	req := beginRequest{
		Slug:        man.Slug,
		Topics:      man.Topics,
		Featured:    man.Featured,
		PublishDate: man.PublishDate,
		SourceDir:   dir,
		RequestedBy: actor,
		Locales:     locales,
	}

	res, err := begin(apiBase, token, req)
	if err != nil {
		return err
	}

	byLang := map[string]localeSpec{}
	for _, l := range locales {
		byLang[l.Lang] = l
	}

	for _, u := range res.Uploads {
		spec, ok := byLang[u.Lang]
		if !ok {
			return fmt.Errorf("%s: server asked for an upload of unknown language %q", man.Slug, u.Lang)
		}

		if err := upload(u.PutURL, spec.path); err != nil {
			return fmt.Errorf("%s [%s]: %w", man.Slug, u.Lang, err)
		}

		fmt.Printf("uploaded %s [%s] -> %s\n", man.Slug, u.Lang, u.Key)
	}

	for _, lang := range res.Skipped {
		fmt.Printf("unchanged %s [%s]\n", man.Slug, lang)
	}

	if err := commit(apiBase, token, man.Slug); err != nil {
		return err
	}

	fmt.Printf("published %s (%s)\n", man.Slug, strings.Join(langsOf(locales), ", "))
	return nil
}

func readManifest(dir string) (manifest, error) {
	var man manifest
	raw, err := os.ReadFile(filepath.Join(dir, "manifest.json"))
	if err != nil {
		return man, fmt.Errorf("read manifest in %s: %w", dir, err)
	}

	if err := json.Unmarshal(raw, &man); err != nil {
		return man, fmt.Errorf("parse manifest in %s: %w", dir, err)
	}

	if man.Slug == "" {
		return man, fmt.Errorf("%s: manifest has no slug", dir)
	}

	if len(man.Locales) == 0 {
		return man, fmt.Errorf("%s: manifest declares no locale", dir)
	}

	return man, nil
}

func collectLocales(dir string, man manifest) ([]localeSpec, error) {
	langs := make([]string, 0, len(man.Locales))
	for lang := range man.Locales {
		langs = append(langs, lang)
	}

	sort.Strings(langs)

	out := make([]localeSpec, 0, len(langs))
	for _, lang := range langs {
		loc := man.Locales[lang]
		if loc.Entry == "" {
			return nil, fmt.Errorf("%s [%s]: manifest locale has no entry", man.Slug, lang)
		}

		path := filepath.Join(dir, loc.Entry)
		info, err := os.Stat(path)
		if err != nil {
			return nil, fmt.Errorf("%s [%s]: %w", man.Slug, lang, err)
		}

		sum, err := sha256File(path)
		if err != nil {
			return nil, err
		}

		out = append(out, localeSpec{
			Lang:      lang,
			Title:     loc.Title,
			Shortdesc: loc.Shortdesc,
			Longdesc:  loc.Longdesc,
			Pages:     loc.Pages,
			Filename:  filepath.Base(loc.Entry),
			SHA256:    sum,
			ByteSize:  info.Size(),
			path:      path,
		})
	}

	return out, nil
}

func sha256File(path string) (string, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", err
	}

	defer f.Close()

	h := sha256.New()
	if _, err := io.Copy(h, f); err != nil {
		return "", err
	}

	return hex.EncodeToString(h.Sum(nil)), nil
}

func begin(apiBase, token string, req beginRequest) (beginResponse, error) {
	var out beginResponse
	body, err := json.Marshal(req)
	if err != nil {
		return out, err
	}

	resp, err := do(http.MethodPost, endpoint(apiBase, "/api/admin/whitepapers/ingest/begin"), token, body)
	if err != nil {
		return out, err
	}
	defer resp.Body.Close()

	if err := expectOK(resp, "begin"); err != nil {
		return out, err
	}

	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return out, fmt.Errorf("decode begin response: %w", err)
	}

	return out, nil
}

func upload(putURL, path string) error {
	f, err := os.Open(path)
	if err != nil {
		return err
	}
	defer f.Close()

	info, err := f.Stat()
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPut, putURL, f)
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/pdf")
	req.ContentLength = info.Size()

	resp, err := (&http.Client{Timeout: 5 * time.Minute}).Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))
		return fmt.Errorf("PUT %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))
	}

	return nil
}

func commit(apiBase, token, slug string) error {
	body, err := json.Marshal(map[string]string{"slug": slug})
	if err != nil {
		return err
	}

	resp, err := do(http.MethodPost, endpoint(apiBase, "/api/admin/whitepapers/ingest/commit"), token, body)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return expectOK(resp, "commit")
}

func deleteWhitePaper(apiBase, token, slug string) error {
	resp, err := do(http.MethodDelete, endpoint(apiBase, "/api/admin/whitepapers/"+url.PathEscape(slug)), token, nil)
	if err != nil {
		return err
	}

	defer resp.Body.Close()

	return expectOK(resp, "delete")
}

func do(method, url, token string, body []byte) (*http.Response, error) {
	var reader io.Reader
	if body != nil {
		reader = bytes.NewReader(body)
	}

	req, err := http.NewRequest(method, url, reader)
	if err != nil {
		return nil, err
	}

	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	req.Header.Set("Authorization", "Bearer "+token)
	return (&http.Client{Timeout: time.Minute}).Do(req)
}

func expectOK(resp *http.Response, step string) error {
	if resp.StatusCode < 300 {
		return nil
	}

	b, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
	return fmt.Errorf("%s: HTTP %d: %s", step, resp.StatusCode, strings.TrimSpace(string(b)))
}

func endpoint(apiBase, path string) string {
	return strings.TrimRight(apiBase, "/") + path
}

func langsOf(locales []localeSpec) []string {
	out := make([]string, len(locales))
	for i, l := range locales {
		out[i] = l.Lang
	}

	return out
}

func requireAPI(apiBase, token string) error {
	if strings.TrimSpace(apiBase) == "" {
		return fmt.Errorf("-api (or API_BASE_URL) is required")
	}

	if strings.TrimSpace(token) == "" {
		return fmt.Errorf("-token (or INGEST_TOKEN) is required")
	}

	return nil
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}

	return fallback
}

func exitOn(err error) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
}
