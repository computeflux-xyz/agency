package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	pcontracts "github.com/computeflux-xyz/agency/services/site-api/presentation/contracts"
	"github.com/computeflux-xyz/agency/services/site-api/presentation/dtos"
)

type ArticleHandler struct {
	reader pcontracts.ArticleReader
}

func NewArticleHandler(reader pcontracts.ArticleReader) *ArticleHandler {
	return &ArticleHandler{reader: reader}
}

// HandleListArticles godoc
// @Summary      List published articles
// @Description  Paginated list of published articles/studies with topic, type and full-text filters.
// @Tags         articles
// @Produce      json
// @Param        types     query    string false "Comma-separated types: blog,study"
// @Param        topics    query    string false "Comma-separated topic slugs"
// @Param        featured  query    boolean false "Only featured articles"
// @Param        q         query    string false "Full-text search over title/summary/body"
// @Param        sort      query    string false "recent | title | featured (default)"
// @Param        page      query    int    false "1-based page (default 1)"
// @Param        pageSize  query    int    false "Items per page (default 12, max 100)"
// @Success      200 {object} dtos.PaginatedArticlesResp
// @Failure      400 {object} dtos.ErrorResp
// @Router       /api/articles [get]
func (h *ArticleHandler) HandleListArticles(c *gin.Context) {
	filter, err := parseArticleListFilter(c)
	if err != nil {
		_ = c.Error(err)
		return
	}

	result, err := h.reader.ListArticles(c.Request.Context(), filter)
	if err != nil {
		_ = c.Error(err)
		return
	}

	c.JSON(http.StatusOK, dtos.ArticlesToPaginatedResp(result, filter.Pagination.Normalized()))
}

// HandleGetArticle godoc
// @Summary      Get a published article
// @Description  Returns article metadata plus the render manifest (entry URL + R2 blob list).
// @Tags         articles
// @Produce      json
// @Param        slug path string true "Article slug"
// @Success      200 {object} dtos.ArticleDetailResp
// @Failure      404 {object} dtos.ErrorResp
// @Router       /api/articles/{slug} [get]
func (h *ArticleHandler) HandleGetArticle(c *gin.Context) {
	article, err := h.reader.GetArticle(c.Request.Context(), c.Param("slug"))
	if err != nil {
		_ = c.Error(err)
		return
	}

	c.JSON(http.StatusOK, dtos.ArticleToDetailResp(*article))
}

// HandleListTopics godoc
// @Summary      List topics
// @Description  Curated taxonomy with published-article counts.
// @Tags         articles
// @Produce      json
// @Success      200 {array} dtos.TopicResp
// @Router       /api/topics [get]
func (h *ArticleHandler) HandleListTopics(c *gin.Context) {
	topics, err := h.reader.ListTopics(c.Request.Context())
	if err != nil {
		_ = c.Error(err)
		return
	}

	c.JSON(http.StatusOK, dtos.TopicsToResp(topics))
}
