package email

import (
	"context"

	"github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	"github.com/computeflux-xyz/agency/services/site-api/models"
	"github.com/sirupsen/logrus"
)

type NoOpWhitePaperMailer struct {
	log *logrus.Logger
}

func NewNoOpWhitePaperMailer(log *logrus.Logger) *NoOpWhitePaperMailer {
	return &NoOpWhitePaperMailer{log: log}
}

func (m *NoOpWhitePaperMailer) SendDocument(_ context.Context, req models.WhitePaperRequest, doc contracts.WhitePaperAttachment) error {
	m.log.WithFields(logrus.Fields{
		"to":       req.Email,
		"slug":     req.Slug,
		"lang":     req.Lang,
		"filename": doc.Filename,
		"bytes":    len(doc.Content),
	}).Info("resend disabled: skipping whitepaper delivery email")

	return nil
}

func (m *NoOpWhitePaperMailer) SendAdminNotification(_ context.Context, req models.WhitePaperRequest, title string) error {
	m.log.WithFields(logrus.Fields{
		"contact_email": req.Email,
		"whitepaper":    title,
	}).Info("resend disabled: skipping whitepaper admin notification email")

	return nil
}
