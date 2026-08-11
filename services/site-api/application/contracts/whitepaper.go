package contracts

import (
	"context"

	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type WhitePaperLocaleSpec struct {
	Lang      models.Lang
	Title     string
	ShortDesc string
	LongDesc  string
	Pages     int
	Filename  string
	SHA256    string
	ByteSize  int64
}

type WhitePaperIngestRequest struct {
	Slug        string
	Topics      []string
	Featured    bool
	PublishDate string
	SourceDir   string
	RequestedBy string
	Locales     []WhitePaperLocaleSpec
}

type WhitePaperUpload struct {
	Lang   models.Lang
	Key    string
	PutURL string
}

type WhitePaperIngestResponse struct {
	Slug    string
	Uploads []WhitePaperUpload
	Skipped []string
}

type WhitePaperListFilter struct {
	Lang     models.Lang
	Featured *bool
}

type WhitePaperReadStorage interface {
	ListPublished(ctx context.Context, filter WhitePaperListFilter) ([]models.WhitePaper, error)
	GetPublishedBySlug(ctx context.Context, slug string) (*models.WhitePaper, error)
}

type WhitePaperWriteStorage interface {
	UpsertWhitePaper(ctx context.Context, paper *models.WhitePaper) (*models.WhitePaper, error)
	GetDraft(ctx context.Context, slug string) (*models.WhitePaper, error)
	PublishWhitePaper(ctx context.Context, slug string, langs []models.Lang) (*models.WhitePaper, error)
	DeleteWhitePaper(ctx context.Context, slug string) (keys []string, err error)
	CreateRequest(ctx context.Context, req *models.WhitePaperRequest) error
	MarkRequestDelivered(ctx context.Context, id string, status models.WhitePaperDeliveryStatus, failure string) error
}

type WhitePaperMailer interface {
	SendDocument(ctx context.Context, req models.WhitePaperRequest, doc WhitePaperAttachment) error
	SendAdminNotification(ctx context.Context, req models.WhitePaperRequest, title string) error
}

type WhitePaperAttachment struct {
	Filename string
	Content  []byte
}
