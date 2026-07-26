package contracts

import (
	"context"

	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type ContactStorage interface {
	CreateSubmission(ctx context.Context, sub *models.ContactSubmission) error
}
