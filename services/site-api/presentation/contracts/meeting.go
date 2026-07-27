package contracts

import (
	"context"

	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type MeetingRequester interface {
	Submit(ctx context.Context, req models.MeetingRequest) (*models.MeetingRequest, error)
}
