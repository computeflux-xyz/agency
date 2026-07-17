package contracts

import (
	"context"

	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type ArticleSort string

const (
	ArticleSortDefault ArticleSort = ""
	ArticleSortRecent  ArticleSort = "recent"
	ArticleSortTitle   ArticleSort = "title"
)

type ArticleListFilter struct {
	Types      []models.ArticleType
	TopicSlugs []string
	Featured   *bool
	Status     models.ArticleStatus
	Search     string
	Sort       ArticleSort
	Pagination Pagination
}

type ArticleListResult struct {
	Articles   []models.Article
	Total      int64
	TotalBlog  int64
	TotalStudy int64
}

type TopicWithCount struct {
	Topic        models.Topic
	ArticleCount int64
}

type ArticleReadStorage interface {
	ListArticles(ctx context.Context, filter ArticleListFilter) (ArticleListResult, error)
	GetPublishedArticleBySlug(ctx context.Context, slug string) (*models.Article, error)
	ListTopics(ctx context.Context) ([]TopicWithCount, error)
}

type IngestJobInput struct {
	SourceCommit     string
	SourceRef        string
	ManifestChecksum string
	RequestedBy      string
}

type ArticleWriteStorage interface {
	// NextVersion returns the version number a new build for slug would receive
	// (max existing + 1, or 1 if the article does not exist yet).
	NextVersion(ctx context.Context, slug string) (int, error)
	// FindCommittedVersionByChecksum returns an already-published version of slug
	// whose manifest checksum matches, enabling idempotent re-publishes. Returns
	// (nil, nil) when none exists.
	FindCommittedVersionByChecksum(ctx context.Context, slug, checksum string) (*models.ArticleVersion, error)
	// BeginIngest upserts the article (draft), inserts the draft version and the
	// ingest job in one transaction, and returns the persisted version id and
	// job id.
	BeginIngest(ctx context.Context, article *models.Article, version *models.ArticleVersion, topicSlugs, authorSlugs []string, job IngestJobInput) (versionID string, jobID string, err error)
	// GetDraftVersion loads a draft version (with its planned manifest) and its
	// parent article by version id.
	GetDraftVersion(ctx context.Context, versionID string) (*models.ArticleVersion, *models.Article, error)
	// CommitIngest persists the version's assets, marks the version published,
	// flips the article's current_version_id, publishes the article, and closes
	// the ingest job, all in one transaction. Returns the published article.
	CommitIngest(ctx context.Context, versionID, jobID string, assets []models.ArticleAsset, manifest models.Manifest) (*models.Article, error)
	// FailIngest marks an ingest job failed with a reason.
	FailIngest(ctx context.Context, jobID, reason string) error
	// DeleteArticle removes an article (and cascades versions/assets rows). It
	// returns the R2 prefixes that were owned by the article so the caller can
	// purge the blobs.
	DeleteArticle(ctx context.Context, slug string) (prefixes []string, err error)
}
