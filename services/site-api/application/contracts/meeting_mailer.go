package contracts

import (
	"context"

	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type MeetingMailer interface {
	SendAcknowledgement(ctx context.Context, req models.MeetingRequest) error
	SendAdminNotification(ctx context.Context, req models.MeetingRequest) error
}
