package whitepapers

import (
	"context"

	"github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	errorx "github.com/computeflux-xyz/agency/services/site-api/application/error"
	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type ReadUseCase struct {
	store contracts.WhitePaperReadStorage
}

func NewReadUseCase(store contracts.WhitePaperReadStorage) *ReadUseCase {
	return &ReadUseCase{store: store}
}

func (uc *ReadUseCase) List(ctx context.Context, filter contracts.WhitePaperListFilter) ([]models.WhitePaper, error) {
	if !filter.Lang.Valid() {
		filter.Lang = models.LangDefault
	}

	return uc.store.ListPublished(ctx, filter)
}

func (uc *ReadUseCase) Get(ctx context.Context, slug string) (*models.WhitePaper, error) {
	paper, err := uc.store.GetPublishedBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}

	if paper == nil {
		return nil, errorx.NewNotFound("whitepaper %q not found", slug)
	}

	return paper, nil
}
