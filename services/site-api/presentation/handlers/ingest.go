package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	appcontracts "github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	"github.com/computeflux-xyz/agency/services/site-api/models"
	pcontracts "github.com/computeflux-xyz/agency/services/site-api/presentation/contracts"
	"github.com/computeflux-xyz/agency/services/site-api/presentation/dtos"
)

type IngestHandler struct {
	ingester pcontracts.ArticleIngester
}

func NewIngestHandler(ingester pcontracts.ArticleIngester) *IngestHandler {
	return &IngestHandler{ingester: ingester}
}

// HandleBegin godoc
// @Summary      Begin an article publish
// @Description  Admin only. Registers a draft version and returns presigned R2 PUT URLs for the blobs that still need uploading.
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        body body dtos.IngestBeginReq true "Article metadata + built file list"
// @Success      200 {object} dtos.IngestBeginResp
// @Failure      400 {object} dtos.ErrorResp
// @Failure      401 {object} dtos.ErrorResp
// @Security     BearerAuth
// @Router       /api/admin/articles/ingest/begin [post]
func (h *IngestHandler) HandleBegin(c *gin.Context) {
	var body dtos.IngestBeginReq
	if err := bindJSON(c, &body); err != nil {
		_ = c.Error(err)
		return
	}

	files := make([]appcontracts.IngestFileSpec, len(body.Files))
	for i, f := range body.Files {
		files[i] = appcontracts.IngestFileSpec{
			Path:         f.Path,
			SHA256:       f.SHA256,
			ByteSize:     f.ByteSize,
			ContentType:  f.ContentType,
			IsEntrypoint: f.IsEntrypoint,
		}
	}

	req := appcontracts.IngestBeginRequest{
		Slug:           body.Slug,
		Type:           models.ArticleType(body.Type),
		Title:          body.Title,
		ShortDesc:      body.ShortDesc,
		LongDesc:       body.LongDesc,
		Topics:         body.Topics,
		Authors:        body.Authors,
		Featured:       body.Featured,
		ReadingMinutes: body.ReadingMinutes,
		SEOTitle:       body.SEOTitle,
		SEODescription: body.SEODescription,
		CanonicalURL:   body.CanonicalURL,
		CoverPath:      body.CoverPath,
		CoverVideoPath: body.CoverVideoPath,
		SourceDir:      body.SourceDir,
		SourceCommit:   body.SourceCommit,
		SourceRef:      body.SourceRef,
		RequestedBy:    c.GetHeader("X-Ingest-Actor"),
		Files:          files,
	}

	resp, err := h.ingester.Begin(c.Request.Context(), req)
	if err != nil {
		_ = c.Error(err)
		return
	}

	c.JSON(http.StatusOK, dtos.BeginRespFrom(resp))
}

// HandleCommit godoc
// @Summary      Commit an article publish
// @Description  Admin only. Verifies all blobs were uploaded, then atomically publishes the version.
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        body body dtos.IngestCommitReq true "Version + job identifiers from begin"
// @Success      200 {object} dtos.ArticleDetailResp
// @Failure      400 {object} dtos.ErrorResp
// @Failure      401 {object} dtos.ErrorResp
// @Security     BearerAuth
// @Router       /api/admin/articles/ingest/commit [post]
func (h *IngestHandler) HandleCommit(c *gin.Context) {
	var body dtos.IngestCommitReq
	if err := bindJSON(c, &body); err != nil {
		_ = c.Error(err)
		return
	}

	article, err := h.ingester.Commit(c.Request.Context(), appcontracts.IngestCommitRequest{
		VersionID: body.VersionID,
		JobID:     body.JobID,
	})
	if err != nil {
		_ = c.Error(err)
		return
	}

	c.JSON(http.StatusOK, dtos.ArticleToDetailResp(*article))
}

// HandleDelete godoc
// @Summary      Delete an article
// @Description  Admin only. Removes the article and purges its R2 blobs.
// @Tags         admin
// @Param        slug path string true "Article slug"
// @Success      204 "No Content"
// @Failure      401 {object} dtos.ErrorResp
// @Failure      404 {object} dtos.ErrorResp
// @Security     BearerAuth
// @Router       /api/admin/articles/{slug} [delete]
func (h *IngestHandler) HandleDelete(c *gin.Context) {
	if err := h.ingester.Delete(c.Request.Context(), c.Param("slug")); err != nil {
		_ = c.Error(err)
		return
	}

	c.Status(http.StatusNoContent)
}
