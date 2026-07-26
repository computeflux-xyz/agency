package contracts

import (
	"context"

	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type ContactMailer interface {
	SendAcknowledgement(ctx context.Context, sub models.ContactSubmission) error
	SendAdminNotification(ctx context.Context, sub models.ContactSubmission) error
}
