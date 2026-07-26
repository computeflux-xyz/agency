package email

import (
	"context"

	"github.com/computeflux-xyz/agency/services/site-api/models"
	"github.com/sirupsen/logrus"
)

type NoOpContactMailer struct {
	log *logrus.Logger
}

func NewNoOpContactMailer(log *logrus.Logger) *NoOpContactMailer {
	return &NoOpContactMailer{log: log}
}

func (m *NoOpContactMailer) SendAcknowledgement(_ context.Context, sub models.ContactSubmission) error {
	m.log.WithField("to", sub.Email).Info("resend disabled: skipping contact acknowledgement email")
	return nil
}

func (m *NoOpContactMailer) SendAdminNotification(_ context.Context, sub models.ContactSubmission) error {
	m.log.WithField("contact_email", sub.Email).Info("resend disabled: skipping contact admin notification email")
	return nil
}
