package models

import (
	"strings"
	"time"
)

type ArticleType string

const (
	ArticleTypeBlog  ArticleType = "blog"
	ArticleTypeStudy ArticleType = "study"
)

func (t ArticleType) Valid() bool {
	return t == ArticleTypeBlog || t == ArticleTypeStudy
}

func ParseArticleType(s string) (ArticleType, bool) {
	t := ArticleType(strings.ToLower(strings.TrimSpace(s)))
	return t, t.Valid()
}

type ArticleStatus string

const (
	ArticleStatusDraft     ArticleStatus = "draft"
	ArticleStatusPublished ArticleStatus = "published"
	ArticleStatusArchived  ArticleStatus = "archived"
)

func (s ArticleStatus) Valid() bool {
	switch s {
	case ArticleStatusDraft, ArticleStatusPublished, ArticleStatusArchived:
		return true
	default:
		return false
	}
}

type AssetKind string

const (
	AssetKindEntry   AssetKind = "entry"   // a page .html at the dist root
	AssetKindRuntime AssetKind = "runtime" // _observablehq/ runtime + theme
	AssetKindNpm     AssetKind = "npm"     // _npm/ vendored libraries
	AssetKindImport  AssetKind = "import"  // _import/ the project's own modules
	AssetKindFile    AssetKind = "file"    // _file/ attachments + loader output
	AssetKindCover   AssetKind = "cover"   // resolved cover image/video
	AssetKindOther   AssetKind = "other"
)

// Article is the core editorial aggregate. CurrentVersion is populated only on
// detail reads. Topics/Authors are populated as needed.
type Article struct {
	ID             string
	Slug           string
	Type           ArticleType
	Title          string
	ShortDesc      string
	LongDesc       string
	Status         ArticleStatus
	Featured       bool
	SortOrder      int
	CoverImageURL  string
	CoverVideoURL  string
	ReadingMinutes int
	SEOTitle       string
	SEODescription string
	CanonicalURL   string
	SourceDir      string
	PublishedAt    *time.Time
	CreatedAt      time.Time
	UpdatedAt      time.Time

	Topics         []Topic
	Authors        []Author
	CurrentVersion *ArticleVersion
}

// ArticleVersion is an immutable snapshot produced by one publish. The live
// version is referenced by Article via current_version_id.
type ArticleVersion struct {
	ID          string
	ArticleID   string
	Version     int
	Status      ArticleStatus
	R2Prefix    string
	Entrypoint  string
	Manifest    Manifest
	BuildCommit string
	BuildRef    string
	Checksum    string
	ByteSize    int64
	FileCount   int
	CreatedAt   time.Time
	CommittedAt *time.Time
	Assets      []ArticleAsset
}

// ArticleAsset is a single blob belonging to a version (one file of the built
// dist/ tree), stored in R2 and referenced by key.
type ArticleAsset struct {
	Path         string
	R2Key        string
	ContentType  string
	ByteSize     int64
	SHA256       string
	Kind         AssetKind
	IsEntrypoint bool
}
