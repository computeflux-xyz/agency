package handlers

import (
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	errorx "github.com/computeflux-xyz/agency/services/site-api/application/error"
	"github.com/computeflux-xyz/agency/services/site-api/models"
)

func parsePagination(c *gin.Context) contracts.Pagination {
	p := contracts.DefaultPagination()
	if v := c.Query("page"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			p.Page = n
		}
	}

	size := c.Query("pageSize")
	if size == "" {
		size = c.Query("page_size")
	}

	if size != "" {
		if n, err := strconv.Atoi(size); err == nil {
			p.PageSize = n
		}
	}

	return p.Normalized()
}

func csvParam(c *gin.Context, keys ...string) []string {
	var out []string
	for _, key := range keys {
		for _, raw := range c.QueryArray(key) {
			for _, part := range strings.Split(raw, ",") {
				if p := strings.TrimSpace(part); p != "" {
					out = append(out, p)
				}
			}
		}
	}

	return out
}

func boolPtrParam(c *gin.Context, key string) *bool {
	v := c.Query(key)
	if v == "" {
		return nil
	}

	b, err := strconv.ParseBool(v)
	if err != nil {
		return nil
	}

	return &b
}

func parseArticleListFilter(c *gin.Context) (contracts.ArticleListFilter, error) {
	f := contracts.ArticleListFilter{
		TopicSlugs: csvParam(c, "topics", "topic"),
		Featured:   boolPtrParam(c, "featured"),
		Search:     strings.TrimSpace(firstNonEmpty(c.Query("q"), c.Query("search"))),
		Pagination: parsePagination(c),
	}

	for _, raw := range csvParam(c, "types", "type") {
		t, ok := models.ParseArticleType(raw)
		if !ok {
			return f, errorx.NewBadRequest("invalid type %q (want blog or study)", raw)
		}

		f.Types = append(f.Types, t)
	}

	switch strings.ToLower(c.Query("sort")) {
	case "", "default", "featured":
		f.Sort = contracts.ArticleSortDefault
	case "recent", "newest":
		f.Sort = contracts.ArticleSortRecent
	case "title":
		f.Sort = contracts.ArticleSortTitle
	default:
		return f, errorx.NewBadRequest("invalid sort %q", c.Query("sort"))
	}

	return f, nil
}

func bindJSON(c *gin.Context, dst any) error {
	if err := c.ShouldBindJSON(dst); err != nil {
		return errorx.NewBadRequest("invalid request body: %s", err.Error())
	}

	return nil
}

func firstNonEmpty(vals ...string) string {
	for _, v := range vals {
		if v != "" {
			return v
		}
	}

	return ""
}
