package contracts

import "github.com/computeflux-xyz/agency/services/site-api/models"

// IngestFileSpec is one file the publisher declares at the begin step.
type IngestFileSpec struct {
	Path         string // relative path within the built dist/ tree
	SHA256       string
	ByteSize     int64
	ContentType  string
	IsEntrypoint bool
}

// IngestBeginRequest is the metadata + file list submitted to start a publish.
type IngestBeginRequest struct {
	Slug           string
	Type           models.ArticleType
	Title          string
	ShortDesc      string
	LongDesc       string
	Topics         []string
	Authors        []string
	Featured       bool
	ReadingMinutes int
	SEOTitle       string
	SEODescription string
	CanonicalURL   string
	CoverPath      string // dist-relative path of the resolved cover image (optional)
	CoverVideoPath string
	SourceDir      string
	SourceCommit   string
	SourceRef      string
	RequestedBy    string
	Files          []IngestFileSpec
}

// IngestUpload tells the publisher where to PUT one blob and its final URL.
type IngestUpload struct {
	Path        string
	Key         string
	URL         string
	PutURL      string
	ContentType string
}

// IngestBeginResponse is returned from the begin step. When AlreadyPublished is
// true the exact build is already live and no uploads are needed.
type IngestBeginResponse struct {
	AlreadyPublished bool
	VersionID        string
	JobID            string
	Version          int
	R2Prefix         string
	BaseURL          string
	Entrypoint       string
	Uploads          []IngestUpload
	Skipped          []string
}

// IngestCommitRequest finalizes a publish started by begin.
type IngestCommitRequest struct {
	VersionID string
	JobID     string
}
