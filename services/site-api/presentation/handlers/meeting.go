package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	pcontracts "github.com/computeflux-xyz/agency/services/site-api/presentation/contracts"
	"github.com/computeflux-xyz/agency/services/site-api/presentation/dtos"
)

type MeetingHandler struct {
	requester pcontracts.MeetingRequester
}

func NewMeetingHandler(requester pcontracts.MeetingRequester) *MeetingHandler {
	return &MeetingHandler{requester: requester}
}

// HandleSubmit godoc
// @Summary      Request a 30-minute meeting
// @Description  Registers a "30-minute Rendez-vous" request and triggers the acknowledgement email to the requester plus a notification email to the team.
// @Tags         meetings
// @Accept       json
// @Produce      json
// @Param        body body dtos.MeetingRequestReq true "Meeting request"
// @Success      201 {object} dtos.MeetingRequestResp
// @Failure      400 {object} dtos.ErrorResp
// @Failure      401 {object} dtos.ErrorResp
// @Security     BearerAuth
// @Router       /api/meetings [post]
func (h *MeetingHandler) HandleSubmit(c *gin.Context) {
	var body dtos.MeetingRequestReq
	if err := bindJSON(c, &body); err != nil {
		_ = c.Error(err)
		return
	}

	req, err := h.requester.Submit(c.Request.Context(), body.ToModel())
	if err != nil {
		_ = c.Error(err)
		return
	}

	c.JSON(http.StatusCreated, dtos.MeetingToRequestResp(*req))
}
