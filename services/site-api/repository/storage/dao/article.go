package dao

import (
	"time"

	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type Article struct {
	ID               string     `gorm:"column:id;primaryKey"`
	Slug             string     `gorm:"column:slug"`
	Type             string     `gorm:"column:type"`
	Title            string     `gorm:"column:title"`
	ShortDesc        string     `gorm:"column:shortdesc"`
	LongDesc         string     `gorm:"column:longdesc"`
	Status           string     `gorm:"column:status"`
	Featured         bool       `gorm:"column:featured"`
	SortOrder        int        `gorm:"column:sort_order"`
	CoverImageURL    string     `gorm:"column:cover_image_url"`
	CoverVideoURL    string     `gorm:"column:cover_video_url"`
	ReadingMinutes   int        `gorm:"column:reading_minutes"`
	SEOTitle         string     `gorm:"column:seo_title"`
	SEODescription   string     `gorm:"column:seo_description"`
	CanonicalURL     string     `gorm:"column:canonical_url"`
	SourceDir        string     `gorm:"column:source_dir"`
	CurrentVersionID *string    `gorm:"column:current_version_id"`
	PublishedAt      *time.Time `gorm:"column:published_at"`
	CreatedAt        time.Time  `gorm:"column:created_at"`
	UpdatedAt        time.Time  `gorm:"column:updated_at"`
}

func (Article) TableName() string { return "articles" }

type ArticleVersion struct {
	ID          string                      `gorm:"column:id;primaryKey"`
	ArticleID   string                      `gorm:"column:article_id"`
	Version     int                         `gorm:"column:version"`
	Status      string                      `gorm:"column:status"`
	R2Prefix    string                      `gorm:"column:r2_prefix"`
	Entrypoint  string                      `gorm:"column:entrypoint"`
	Manifest    JSONColumn[models.Manifest] `gorm:"column:manifest;type:jsonb"`
	BuildCommit string                      `gorm:"column:build_commit"`
	BuildRef    string                      `gorm:"column:build_ref"`
	Checksum    string                      `gorm:"column:checksum"`
	ByteSize    int64                       `gorm:"column:byte_size"`
	FileCount   int                         `gorm:"column:file_count"`
	CreatedAt   time.Time                   `gorm:"column:created_at"`
	CommittedAt *time.Time                  `gorm:"column:committed_at"`
}

func (ArticleVersion) TableName() string { return "article_versions" }

type ArticleAsset struct {
	ID           string    `gorm:"column:id;primaryKey"`
	VersionID    string    `gorm:"column:version_id"`
	Path         string    `gorm:"column:path"`
	R2Key        string    `gorm:"column:r2_key"`
	ContentType  string    `gorm:"column:content_type"`
	ByteSize     int64     `gorm:"column:byte_size"`
	SHA256       string    `gorm:"column:sha256"`
	Kind         string    `gorm:"column:kind"`
	IsEntrypoint bool      `gorm:"column:is_entrypoint"`
	CreatedAt    time.Time `gorm:"column:created_at"`
}

func (ArticleAsset) TableName() string { return "article_assets" }

func ToArticleModel(a Article) models.Article {
	m := models.Article{
		ID:             a.ID,
		Slug:           a.Slug,
		Type:           models.ArticleType(a.Type),
		Title:          a.Title,
		ShortDesc:      a.ShortDesc,
		LongDesc:       a.LongDesc,
		Status:         models.ArticleStatus(a.Status),
		Featured:       a.Featured,
		SortOrder:      a.SortOrder,
		CoverImageURL:  a.CoverImageURL,
		CoverVideoURL:  a.CoverVideoURL,
		ReadingMinutes: a.ReadingMinutes,
		SEOTitle:       a.SEOTitle,
		SEODescription: a.SEODescription,
		CanonicalURL:   a.CanonicalURL,
		SourceDir:      a.SourceDir,
		PublishedAt:    a.PublishedAt,
		CreatedAt:      a.CreatedAt,
		UpdatedAt:      a.UpdatedAt,
	}

	return m
}

func ToArticleVersionModel(v ArticleVersion) models.ArticleVersion {
	return models.ArticleVersion{
		ID:          v.ID,
		ArticleID:   v.ArticleID,
		Version:     v.Version,
		Status:      models.ArticleStatus(v.Status),
		R2Prefix:    v.R2Prefix,
		Entrypoint:  v.Entrypoint,
		Manifest:    v.Manifest.Val,
		BuildCommit: v.BuildCommit,
		BuildRef:    v.BuildRef,
		Checksum:    v.Checksum,
		ByteSize:    v.ByteSize,
		FileCount:   v.FileCount,
		CreatedAt:   v.CreatedAt,
		CommittedAt: v.CommittedAt,
	}
}

func ToArticleAssetModel(a ArticleAsset) models.ArticleAsset {
	return models.ArticleAsset{
		Path:         a.Path,
		R2Key:        a.R2Key,
		ContentType:  a.ContentType,
		ByteSize:     a.ByteSize,
		SHA256:       a.SHA256,
		Kind:         models.AssetKind(a.Kind),
		IsEntrypoint: a.IsEntrypoint,
	}
}
