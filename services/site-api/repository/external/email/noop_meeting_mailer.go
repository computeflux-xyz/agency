package email

import (
	"context"

	"github.com/computeflux-xyz/agency/services/site-api/models"
	"github.com/sirupsen/logrus"
)

type NoOpMeetingMailer struct {
	log *logrus.Logger
}

func NewNoOpMeetingMailer(log *logrus.Logger) *NoOpMeetingMailer {
	return &NoOpMeetingMailer{log: log}
}

func (m *NoOpMeetingMailer) SendAcknowledgement(_ context.Context, req models.MeetingRequest) error {
	m.log.WithField("to", req.Email).Info("resend disabled: skipping meeting acknowledgement email")
	return nil
}

func (m *NoOpMeetingMailer) SendAdminNotification(_ context.Context, req models.MeetingRequest) error {
	m.log.WithField("contact_email", req.Email).Info("resend disabled: skipping meeting admin notification email")
	return nil
}
