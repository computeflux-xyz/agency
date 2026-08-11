package contracts

import (
	"context"

	appcontracts "github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type WhitePaperReader interface {
	List(ctx context.Context, filter appcontracts.WhitePaperListFilter) ([]models.WhitePaper, error)
	Get(ctx context.Context, slug string) (*models.WhitePaper, error)
}

type WhitePaperRequester interface {
	Submit(ctx context.Context, req models.WhitePaperRequest) (*models.WhitePaperRequest, error)
}

type WhitePaperIngester interface {
	Begin(ctx context.Context, req appcontracts.WhitePaperIngestRequest) (appcontracts.WhitePaperIngestResponse, error)
	Commit(ctx context.Context, slug string) (*models.WhitePaper, error)
	Delete(ctx context.Context, slug string) error
}
