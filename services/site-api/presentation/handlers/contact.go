package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	pcontracts "github.com/computeflux-xyz/agency/services/site-api/presentation/contracts"
	"github.com/computeflux-xyz/agency/services/site-api/presentation/dtos"
)

type ContactHandler struct {
	submitter pcontracts.ContactSubmitter
}

func NewContactHandler(submitter pcontracts.ContactSubmitter) *ContactHandler {
	return &ContactHandler{submitter: submitter}
}

// HandleSubmit godoc
// @Summary      Submit a contact request
// @Description  Registers a "Contact us" submission and triggers the acknowledgement email to the contact plus a notification email to the team.
// @Tags         contact
// @Accept       json
// @Produce      json
// @Param        body body dtos.ContactSubmitReq true "Contact submission"
// @Success      201 {object} dtos.ContactSubmitResp
// @Failure      400 {object} dtos.ErrorResp
// @Failure      401 {object} dtos.ErrorResp
// @Security     BearerAuth
// @Router       /api/contact [post]
func (h *ContactHandler) HandleSubmit(c *gin.Context) {
	var body dtos.ContactSubmitReq
	if err := bindJSON(c, &body); err != nil {
		_ = c.Error(err)
		return
	}

	sub, err := h.submitter.Submit(c.Request.Context(), body.ToModel())
	if err != nil {
		_ = c.Error(err)
		return
	}

	c.JSON(http.StatusCreated, dtos.ContactToSubmitResp(*sub))
}
