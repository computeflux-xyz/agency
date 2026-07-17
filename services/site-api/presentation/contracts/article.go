package contracts

import (
	"context"

	appcontracts "github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type ArticleReader interface {
	ListArticles(ctx context.Context, filter appcontracts.ArticleListFilter) (appcontracts.ArticleListResult, error)
	GetArticle(ctx context.Context, slug string) (*models.Article, error)
	ListTopics(ctx context.Context) ([]appcontracts.TopicWithCount, error)
}

type ArticleIngester interface {
	Begin(ctx context.Context, req appcontracts.IngestBeginRequest) (appcontracts.IngestBeginResponse, error)
	Commit(ctx context.Context, req appcontracts.IngestCommitRequest) (*models.Article, error)
	Delete(ctx context.Context, slug string) error
}
