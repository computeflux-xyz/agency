package contracts

import (
	"context"

	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type ContactSubmitter interface {
	Submit(ctx context.Context, sub models.ContactSubmission) (*models.ContactSubmission, error)
}
