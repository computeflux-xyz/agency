package articles

import (
	"context"

	"github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type ReadUseCase struct {
	store contracts.ArticleReadStorage
}

func NewReadUseCase(store contracts.ArticleReadStorage) *ReadUseCase {
	return &ReadUseCase{store: store}
}

func (uc *ReadUseCase) ListArticles(ctx context.Context, filter contracts.ArticleListFilter) (contracts.ArticleListResult, error) {
	if filter.Status == "" {
		filter.Status = models.ArticleStatusPublished
	}

	filter.Pagination = filter.Pagination.Normalized()
	return uc.store.ListArticles(ctx, filter)
}

func (uc *ReadUseCase) GetArticle(ctx context.Context, slug string) (*models.Article, error) {
	return uc.store.GetPublishedArticleBySlug(ctx, slug)
}

func (uc *ReadUseCase) ListTopics(ctx context.Context) ([]contracts.TopicWithCount, error) {
	return uc.store.ListTopics(ctx)
}
