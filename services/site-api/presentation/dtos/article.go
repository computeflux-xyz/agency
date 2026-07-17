package dtos

import (
	"time"

	appcontracts "github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type TopicResp struct {
	Name         string `json:"name"`
	Slug         string `json:"slug"`
	Description  string `json:"description,omitempty"`
	ArticleCount int64  `json:"articleCount"`
}

type ArticleSummaryResp struct {
	ID            string      `json:"id"`
	Type          string      `json:"type"`
	Slug          string      `json:"slug"`
	Title         string      `json:"title"`
	ShortDesc     string      `json:"shortdesc"`
	CoverImage    *string     `json:"coverImage"`
	CoverVideo    *string     `json:"coverVideo"`
	Topics        []TopicResp `json:"topics"`
	Featured      bool        `json:"featured"`
	ReadingTime   int         `json:"readingTime"`
	DatePublished string      `json:"datePublished"`
	DateUpdated   string      `json:"dateUpdated"`
}

type ManifestFileResp struct {
	Path         string `json:"path"`
	URL          string `json:"url"`
	ContentType  string `json:"contentType"`
	ByteSize     int64  `json:"byteSize"`
	Kind         string `json:"kind"`
	IsEntrypoint bool   `json:"isEntrypoint"`
}

type ArticleDetailResp struct {
	ArticleSummaryResp
	LongDesc       string             `json:"longdesc"`
	SEOTitle       string             `json:"seoTitle,omitempty"`
	SEODescription string             `json:"seoDescription,omitempty"`
	CanonicalURL   string             `json:"canonicalUrl,omitempty"`
	Author         []AuthorResp       `json:"authors"`
	Version        int                `json:"version"`
	Entrypoint     string             `json:"entrypoint"`
	BaseURL        string             `json:"baseUrl"`
	EntryURL       string             `json:"entryUrl"`
	Assets         []ManifestFileResp `json:"assets"`
}

type AuthorResp struct {
	Name      string `json:"name"`
	Slug      string `json:"slug"`
	Title     string `json:"title,omitempty"`
	AvatarURL string `json:"avatarUrl,omitempty"`
}

type PaginatedArticlesResp struct {
	Items      []ArticleSummaryResp `json:"items"`
	Page       int                  `json:"page"`
	PageSize   int                  `json:"pageSize"`
	Total      int64                `json:"total"`
	TotalBlog  int64                `json:"totalBlogPosts"`
	TotalStudy int64                `json:"totalCaseStudies"`
}

type IngestBeginReq struct {
	Slug           string          `json:"slug" binding:"required"`
	Type           string          `json:"type" binding:"required"`
	Title          string          `json:"title" binding:"required"`
	ShortDesc      string          `json:"shortdesc"`
	LongDesc       string          `json:"longdesc"`
	Topics         []string        `json:"topics"`
	Authors        []string        `json:"authors"`
	Featured       bool            `json:"featured"`
	ReadingMinutes int             `json:"readingMinutes"`
	SEOTitle       string          `json:"seoTitle"`
	SEODescription string          `json:"seoDescription"`
	CanonicalURL   string          `json:"canonicalUrl"`
	CoverPath      string          `json:"coverPath"`
	CoverVideoPath string          `json:"coverVideoPath"`
	SourceDir      string          `json:"sourceDir"`
	SourceCommit   string          `json:"sourceCommit"`
	SourceRef      string          `json:"sourceRef"`
	Files          []IngestFileReq `json:"files" binding:"required"`
}

type IngestFileReq struct {
	Path         string `json:"path" binding:"required"`
	SHA256       string `json:"sha256" binding:"required"`
	ByteSize     int64  `json:"byteSize"`
	ContentType  string `json:"contentType"`
	IsEntrypoint bool   `json:"isEntrypoint"`
}

type IngestUploadResp struct {
	Path        string `json:"path"`
	Key         string `json:"key"`
	URL         string `json:"url"`
	PutURL      string `json:"putUrl"`
	ContentType string `json:"contentType"`
}

type IngestBeginResp struct {
	AlreadyPublished bool               `json:"alreadyPublished"`
	VersionID        string             `json:"versionId"`
	JobID            string             `json:"jobId"`
	Version          int                `json:"version"`
	R2Prefix         string             `json:"prefix"`
	BaseURL          string             `json:"baseUrl"`
	Entrypoint       string             `json:"entrypoint"`
	Uploads          []IngestUploadResp `json:"uploads"`
	Skipped          []string           `json:"skipped"`
}

type IngestCommitReq struct {
	VersionID string `json:"versionId" binding:"required"`
	JobID     string `json:"jobId"`
}

func nilIfEmpty(s string) *string {
	if s == "" {
		return nil
	}

	return &s
}

func topicsToResp(topics []models.Topic) []TopicResp {
	out := make([]TopicResp, len(topics))
	for i, t := range topics {
		out[i] = TopicResp{Name: t.Name, Slug: t.Slug, Description: t.Description}
	}

	return out
}

func ArticleToSummaryResp(a models.Article) ArticleSummaryResp {
	published := ""
	if a.PublishedAt != nil {
		published = a.PublishedAt.UTC().Format(time.RFC3339)
	}

	return ArticleSummaryResp{
		ID:            a.ID,
		Type:          string(a.Type),
		Slug:          a.Slug,
		Title:         a.Title,
		ShortDesc:     a.ShortDesc,
		CoverImage:    nilIfEmpty(a.CoverImageURL),
		CoverVideo:    nilIfEmpty(a.CoverVideoURL),
		Topics:        topicsToResp(a.Topics),
		Featured:      a.Featured,
		ReadingTime:   a.ReadingMinutes,
		DatePublished: published,
		DateUpdated:   a.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

func ArticleToDetailResp(a models.Article) ArticleDetailResp {
	resp := ArticleDetailResp{ArticleSummaryResp: ArticleToSummaryResp(a)}

	resp.LongDesc = a.LongDesc
	resp.SEOTitle = a.SEOTitle
	resp.SEODescription = a.SEODescription
	resp.CanonicalURL = a.CanonicalURL

	resp.Author = make([]AuthorResp, len(a.Authors))
	for i, au := range a.Authors {
		resp.Author[i] = AuthorResp{Name: au.Name, Slug: au.Slug, Title: au.Title, AvatarURL: au.AvatarURL}
	}

	if a.CurrentVersion != nil {
		v := a.CurrentVersion
		resp.Version = v.Version
		resp.Entrypoint = v.Manifest.Entrypoint
		resp.BaseURL = v.Manifest.BaseURL
		resp.EntryURL = v.Manifest.EntryURL()
		resp.Assets = make([]ManifestFileResp, len(v.Manifest.Files))
		for i, f := range v.Manifest.Files {
			resp.Assets[i] = ManifestFileResp{
				Path:         f.Path,
				URL:          f.URL,
				ContentType:  f.ContentType,
				ByteSize:     f.ByteSize,
				Kind:         string(f.Kind),
				IsEntrypoint: f.IsEntrypoint,
			}
		}
	}

	return resp
}

func ArticlesToPaginatedResp(result appcontracts.ArticleListResult, page appcontracts.Pagination) PaginatedArticlesResp {
	items := make([]ArticleSummaryResp, len(result.Articles))
	for i, a := range result.Articles {
		items[i] = ArticleToSummaryResp(a)
	}

	return PaginatedArticlesResp{
		Items:      items,
		Page:       page.Page,
		PageSize:   page.PageSize,
		Total:      result.Total,
		TotalBlog:  result.TotalBlog,
		TotalStudy: result.TotalStudy,
	}
}

func TopicsToResp(topics []appcontracts.TopicWithCount) []TopicResp {
	out := make([]TopicResp, len(topics))
	for i, t := range topics {
		out[i] = TopicResp{
			Name:         t.Topic.Name,
			Slug:         t.Topic.Slug,
			Description:  t.Topic.Description,
			ArticleCount: t.ArticleCount,
		}
	}

	return out
}

func BeginRespFrom(r appcontracts.IngestBeginResponse) IngestBeginResp {
	uploads := make([]IngestUploadResp, len(r.Uploads))
	for i, u := range r.Uploads {
		uploads[i] = IngestUploadResp{Path: u.Path, Key: u.Key, URL: u.URL, PutURL: u.PutURL, ContentType: u.ContentType}
	}

	return IngestBeginResp{
		AlreadyPublished: r.AlreadyPublished,
		VersionID:        r.VersionID,
		JobID:            r.JobID,
		Version:          r.Version,
		R2Prefix:         r.R2Prefix,
		BaseURL:          r.BaseURL,
		Entrypoint:       r.Entrypoint,
		Uploads:          uploads,
		Skipped:          r.Skipped,
	}
}
