package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	appcontracts "github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	errorx "github.com/computeflux-xyz/agency/services/site-api/application/error"
	"github.com/computeflux-xyz/agency/services/site-api/models"
	pcontracts "github.com/computeflux-xyz/agency/services/site-api/presentation/contracts"
	"github.com/computeflux-xyz/agency/services/site-api/presentation/dtos"
)

type WhitePaperHandler struct {
	reader    pcontracts.WhitePaperReader
	requester pcontracts.WhitePaperRequester
}

func NewWhitePaperHandler(reader pcontracts.WhitePaperReader, requester pcontracts.WhitePaperRequester) *WhitePaperHandler {
	return &WhitePaperHandler{reader: reader, requester: requester}
}

// HandleList godoc
// @Summary      List published whitepapers
// @Description  Metadata only. The documents themselves are gated: they are delivered by email after a request.
// @Tags         whitepapers
// @Produce      json
// @Param        lang query string false "Content language (en, fr)"
// @Param        featured query bool false "Only featured whitepapers"
// @Success      200 {array} dtos.WhitePaperResp
// @Router       /api/whitepapers [get]
func (h *WhitePaperHandler) HandleList(c *gin.Context) {
	lang := models.ParseLang(c.Query("lang"))
	papers, err := h.reader.List(c.Request.Context(), appcontracts.WhitePaperListFilter{
		Lang:     lang,
		Featured: boolPtrParam(c, "featured"),
	})
	if err != nil {
		_ = c.Error(err)
		return
	}

	c.JSON(http.StatusOK, dtos.WhitePapersToResp(papers, lang))
}

// HandleGet godoc
// @Summary      Get one published whitepaper
// @Description  Metadata only; never a link to the PDF.
// @Tags         whitepapers
// @Produce      json
// @Param        slug path string true "Whitepaper slug"
// @Param        lang query string false "Content language (en, fr)"
// @Success      200 {object} dtos.WhitePaperResp
// @Failure      404 {object} dtos.ErrorResp
// @Router       /api/whitepapers/{slug} [get]
func (h *WhitePaperHandler) HandleGet(c *gin.Context) {
	lang := models.ParseLang(c.Query("lang"))
	paper, err := h.reader.Get(c.Request.Context(), c.Param("slug"))
	if err != nil {
		_ = c.Error(err)
		return
	}

	c.JSON(http.StatusOK, dtos.WhitePaperToResp(*paper, lang))
}

// HandleRequest godoc
// @Summary      Request a whitepaper
// @Description  Captures the lead and emails the PDF in the requested language, with a notification to the team.
// @Tags         whitepapers
// @Accept       json
// @Produce      json
// @Param        slug path string true "Whitepaper slug"
// @Param        body body dtos.WhitePaperRequestReq true "Contact details"
// @Success      201 {object} dtos.WhitePaperRequestResp
// @Failure      400 {object} dtos.ErrorResp
// @Failure      401 {object} dtos.ErrorResp
// @Failure      404 {object} dtos.ErrorResp
// @Security     BearerAuth
// @Router       /api/whitepapers/{slug}/request [post]
func (h *WhitePaperHandler) HandleRequest(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		_ = c.Error(errorx.NewBadRequest("slug is required"))
		return
	}

	var body dtos.WhitePaperRequestReq
	if err := bindJSON(c, &body); err != nil {
		_ = c.Error(err)
		return
	}

	req, err := h.requester.Submit(c.Request.Context(), body.ToModel(slug))
	if err != nil {
		_ = c.Error(err)
		return
	}

	c.JSON(http.StatusCreated, dtos.WhitePaperRequestResp{
		ID:   req.ID,
		Lang: string(req.Lang),
		OK:   true,
	})
}

type WhitePaperIngestHandler struct {
	ingester pcontracts.WhitePaperIngester
}

func NewWhitePaperIngestHandler(ingester pcontracts.WhitePaperIngester) *WhitePaperIngestHandler {
	return &WhitePaperIngestHandler{ingester: ingester}
}

// HandleBegin godoc
// @Summary      Begin a whitepaper publish
// @Description  Admin only. Upserts the publication as a draft and returns presigned PUT URLs for the editions whose PDF is not already stored.
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        body body dtos.WhitePaperIngestReq true "Whitepaper metadata + one entry per language"
// @Success      200 {object} dtos.WhitePaperIngestResp
// @Failure      400 {object} dtos.ErrorResp
// @Failure      401 {object} dtos.ErrorResp
// @Security     BearerAuth
// @Router       /api/admin/whitepapers/ingest/begin [post]
func (h *WhitePaperIngestHandler) HandleBegin(c *gin.Context) {
	var body dtos.WhitePaperIngestReq
	if err := bindJSON(c, &body); err != nil {
		_ = c.Error(err)
		return
	}

	locales := make([]appcontracts.WhitePaperLocaleSpec, len(body.Locales))
	for i, l := range body.Locales {
		locales[i] = appcontracts.WhitePaperLocaleSpec{
			Lang:      models.ParseLang(l.Lang),
			Title:     l.Title,
			ShortDesc: l.Shortdesc,
			LongDesc:  l.Longdesc,
			Pages:     l.Pages,
			Filename:  l.Filename,
			SHA256:    l.SHA256,
			ByteSize:  l.ByteSize,
		}
	}

	res, err := h.ingester.Begin(c.Request.Context(), appcontracts.WhitePaperIngestRequest{
		Slug:        body.Slug,
		Topics:      body.Topics,
		Featured:    body.Featured,
		PublishDate: body.PublishDate,
		SourceDir:   body.SourceDir,
		RequestedBy: body.RequestedBy,
		Locales:     locales,
	})
	if err != nil {
		_ = c.Error(err)
		return
	}

	uploads := make([]dtos.WhitePaperUploadResp, len(res.Uploads))
	for i, u := range res.Uploads {
		uploads[i] = dtos.WhitePaperUploadResp{Lang: string(u.Lang), Key: u.Key, PutURL: u.PutURL}
	}

	c.JSON(http.StatusOK, dtos.WhitePaperIngestResp{
		Slug:    res.Slug,
		Uploads: uploads,
		Skipped: res.Skipped,
	})
}

// HandleCommit godoc
// @Summary      Commit a whitepaper publish
// @Description  Admin only. Verifies every edition's PDF is stored, then publishes the whitepaper.
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        body body dtos.WhitePaperCommitReq true "Slug to publish"
// @Success      200 {object} dtos.WhitePaperResp
// @Failure      400 {object} dtos.ErrorResp
// @Failure      401 {object} dtos.ErrorResp
// @Security     BearerAuth
// @Router       /api/admin/whitepapers/ingest/commit [post]
func (h *WhitePaperIngestHandler) HandleCommit(c *gin.Context) {
	var body dtos.WhitePaperCommitReq
	if err := bindJSON(c, &body); err != nil {
		_ = c.Error(err)
		return
	}

	paper, err := h.ingester.Commit(c.Request.Context(), body.Slug)
	if err != nil {
		_ = c.Error(err)
		return
	}

	c.JSON(http.StatusOK, dtos.WhitePaperToResp(*paper, models.LangDefault))
}

// HandleDelete godoc
// @Summary      Delete a whitepaper
// @Description  Admin only. Removes the publication and purges its PDFs. Captured leads are kept.
// @Tags         admin
// @Produce      json
// @Param        slug path string true "Whitepaper slug"
// @Success      204
// @Failure      401 {object} dtos.ErrorResp
// @Failure      404 {object} dtos.ErrorResp
// @Security     BearerAuth
// @Router       /api/admin/whitepapers/{slug} [delete]
func (h *WhitePaperIngestHandler) HandleDelete(c *gin.Context) {
	if err := h.ingester.Delete(c.Request.Context(), c.Param("slug")); err != nil {
		_ = c.Error(err)
		return
	}

	c.Status(http.StatusNoContent)
}
