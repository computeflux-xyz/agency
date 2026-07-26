package contact

import (
	"context"
	"strings"

	"github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	errorx "github.com/computeflux-xyz/agency/services/site-api/application/error"
	"github.com/computeflux-xyz/agency/services/site-api/models"
	"github.com/sirupsen/logrus"
)

type SubmitUseCase struct {
	store  contracts.ContactStorage
	mailer contracts.ContactMailer
	log    *logrus.Logger
}

func NewSubmitUseCase(store contracts.ContactStorage, mailer contracts.ContactMailer, log *logrus.Logger) *SubmitUseCase {
	return &SubmitUseCase{store: store, mailer: mailer, log: log}
}

func (uc *SubmitUseCase) Submit(ctx context.Context, sub models.ContactSubmission) (*models.ContactSubmission, error) {
	sub = normalizeContact(sub)
	if err := validateContact(sub); err != nil {
		return nil, err
	}

	if err := uc.store.CreateSubmission(ctx, &sub); err != nil {
		return nil, err
	}

	if err := uc.mailer.SendAcknowledgement(ctx, sub); err != nil {
		uc.log.WithError(err).WithField("submission_id", sub.ID).Error("contact acknowledgement email failed")
	}

	if err := uc.mailer.SendAdminNotification(ctx, sub); err != nil {
		uc.log.WithError(err).WithField("submission_id", sub.ID).Error("contact admin notification email failed")
	}

	return &sub, nil
}

func normalizeContact(sub models.ContactSubmission) models.ContactSubmission {
	sub.Name = strings.TrimSpace(sub.Name)
	sub.Surname = strings.TrimSpace(sub.Surname)
	sub.Email = strings.TrimSpace(sub.Email)
	sub.PhoneNumber = strings.TrimSpace(sub.PhoneNumber)
	sub.Company = strings.TrimSpace(sub.Company)
	sub.LinkedInProfile = strings.TrimSpace(sub.LinkedInProfile)
	sub.Message = strings.TrimSpace(sub.Message)
	return sub
}

func validateContact(sub models.ContactSubmission) error {
	fields := map[string]string{}
	if sub.Name == "" {
		fields["name"] = "name is required"
	}

	if sub.Surname == "" {
		fields["surname"] = "surname is required"
	}

	if sub.Email == "" {
		fields["email"] = "email is required"
	}

	if sub.PhoneNumber == "" {
		fields["phoneNumber"] = "phone number is required"
	}

	if !sub.PreferredContact.Valid() {
		fields["preferredContact"] = "preferred contact must be 'phone' or 'email'"
	}

	if sub.Message == "" {
		fields["message"] = "message is required"
	}

	if len(fields) > 0 {
		return errorx.NewValidation("invalid contact submission", fields)
	}

	return nil
}
