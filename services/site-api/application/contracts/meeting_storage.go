package contracts

import (
	"context"

	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type MeetingStorage interface {
	CreateMeetingRequest(ctx context.Context, req *models.MeetingRequest) error
}
