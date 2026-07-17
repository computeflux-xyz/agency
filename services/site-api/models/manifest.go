package models

// Manifest is the render manifest for an article version: the entry document
// plus the full list of R2 blobs the site must pull to render it. It is stored
// denormalized on ArticleVersion (jsonb) so a detail read returns everything in
// a single row.
type Manifest struct {
	Entrypoint string         `json:"entrypoint"`
	BasePrefix string         `json:"basePrefix"` // R2 key prefix, e.g. "articles/blog/slug/v3/"
	BaseURL    string         `json:"baseUrl"`    // public base URL for BasePrefix
	Files      []ManifestFile `json:"files"`
}

// ManifestFile is one blob in the manifest.
type ManifestFile struct {
	Path         string    `json:"path"` // relative path within the dist tree, e.g. "index.html"
	Key          string    `json:"key"`  // full R2 object key
	URL          string    `json:"url"`  // public URL
	ContentType  string    `json:"contentType"`
	ByteSize     int64     `json:"byteSize"`
	SHA256       string    `json:"sha256"`
	Kind         AssetKind `json:"kind"`
	IsEntrypoint bool      `json:"isEntrypoint"`
}

// EntryURL returns the absolute URL of the entry document (what the site loads
// into the sandboxed iframe), or empty string if unavailable.
func (m Manifest) EntryURL() string {
	for _, f := range m.Files {
		if f.IsEntrypoint {
			return f.URL
		}
	}

	if m.BaseURL != "" && m.Entrypoint != "" {
		return m.BaseURL + "/" + m.Entrypoint
	}

	return ""
}
