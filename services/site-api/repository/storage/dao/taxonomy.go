package dao

import (
	"time"

	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type Topic struct {
	ID          string    `gorm:"column:id;primaryKey"`
	Slug        string    `gorm:"column:slug"`
	Name        string    `gorm:"column:name"`
	Description string    `gorm:"column:description"`
	SortOrder   int       `gorm:"column:sort_order"`
	CreatedAt   time.Time `gorm:"column:created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at"`
}

func (Topic) TableName() string { return "topics" }

type Author struct {
	ID        string                        `gorm:"column:id;primaryKey"`
	Slug      string                        `gorm:"column:slug"`
	Name      string                        `gorm:"column:name"`
	Title     string                        `gorm:"column:title"`
	Bio       string                        `gorm:"column:bio"`
	AvatarURL string                        `gorm:"column:avatar_url"`
	Links     JSONColumn[map[string]string] `gorm:"column:links;type:jsonb"`
	CreatedAt time.Time                     `gorm:"column:created_at"`
	UpdatedAt time.Time                     `gorm:"column:updated_at"`
}

func (Author) TableName() string { return "authors" }

type ArticleTopic struct {
	ArticleID string `gorm:"column:article_id;primaryKey"`
	TopicID   string `gorm:"column:topic_id;primaryKey"`
}

func (ArticleTopic) TableName() string { return "article_topics" }

type ArticleAuthor struct {
	ArticleID string `gorm:"column:article_id;primaryKey"`
	AuthorID  string `gorm:"column:author_id;primaryKey"`
	SortOrder int    `gorm:"column:sort_order"`
}

func (ArticleAuthor) TableName() string { return "article_authors" }

type IngestJob struct {
	ID               string     `gorm:"column:id;primaryKey"`
	ArticleSlug      string     `gorm:"column:article_slug"`
	ArticleType      string     `gorm:"column:article_type"`
	Version          int        `gorm:"column:version"`
	Status           string     `gorm:"column:status"`
	SourceCommit     string     `gorm:"column:source_commit"`
	SourceRef        string     `gorm:"column:source_ref"`
	ManifestChecksum string     `gorm:"column:manifest_checksum"`
	RequestedBy      string     `gorm:"column:requested_by"`
	Error            string     `gorm:"column:error"`
	CreatedAt        time.Time  `gorm:"column:created_at"`
	UpdatedAt        time.Time  `gorm:"column:updated_at"`
	CommittedAt      *time.Time `gorm:"column:committed_at"`
}

func (IngestJob) TableName() string { return "ingest_jobs" }

func ToTopicModel(t Topic) models.Topic {
	return models.Topic{
		ID:          t.ID,
		Slug:        t.Slug,
		Name:        t.Name,
		Description: t.Description,
		SortOrder:   t.SortOrder,
		CreatedAt:   t.CreatedAt,
		UpdatedAt:   t.UpdatedAt,
	}
}

func ToAuthorModel(a Author) models.Author {
	return models.Author{
		ID:        a.ID,
		Slug:      a.Slug,
		Name:      a.Name,
		Title:     a.Title,
		Bio:       a.Bio,
		AvatarURL: a.AvatarURL,
		Links:     a.Links.Val,
		CreatedAt: a.CreatedAt,
		UpdatedAt: a.UpdatedAt,
	}
}
