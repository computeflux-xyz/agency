package email

import (
	"context"
	"fmt"

	"github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	"github.com/computeflux-xyz/agency/services/site-api/models"
	"github.com/computeflux-xyz/base-go/mailer"
)

type WhitePaperConfig struct {
	AdminEmail      string
	TemplateID      string
	AdminTemplateID string
}

type ResendWhitePaperMailer struct {
	mailer mailer.TemplateMailer
	cfg    WhitePaperConfig
}

func NewResendWhitePaperMailer(m mailer.TemplateMailer, cfg WhitePaperConfig) *ResendWhitePaperMailer {
	return &ResendWhitePaperMailer{mailer: m, cfg: cfg}
}

func (m *ResendWhitePaperMailer) SendDocument(ctx context.Context, req models.WhitePaperRequest, doc contracts.WhitePaperAttachment) error {
	if _, err := m.mailer.SendTemplate(ctx, mailer.SendTemplateRequest{
		To:         []string{req.Email},
		TemplateID: m.cfg.TemplateID,
		Variables: map[string]interface{}{
			"SURNAME": req.Surname,
		},
		Attachments: []mailer.Attachment{{
			Filename:    doc.Filename,
			Content:     doc.Content,
			ContentType: "application/pdf",
		}},
	}); err != nil {
		return fmt.Errorf("send whitepaper document: %w", err)
	}

	return nil
}

func (m *ResendWhitePaperMailer) SendAdminNotification(ctx context.Context, req models.WhitePaperRequest, title string) error {
	if _, err := m.mailer.SendTemplate(ctx, mailer.SendTemplateRequest{
		To:         []string{m.cfg.AdminEmail},
		ReplyTo:    req.Email,
		TemplateID: m.cfg.AdminTemplateID,
		Variables: map[string]interface{}{
			"ASKED_WHITEPAPER_NAME":       whitePaperName(title, req.Slug, req.Lang),
			"NAME":                        req.Name,
			"SURNAME":                     req.Surname,
			"CONTACT_EMAIL":               req.Email,
			"CONTACT_PHONE_NUMBER":        req.PhoneNumber,
			"CONTACT_COMPANY":             req.Company,
			"CONTACT_LINKEDIN_PROFILE":    req.LinkedInProfile,
			"PREFERRED_COMMUNICATION_WAY": string(req.PreferredContact),
			"MESSAGE":                     req.Message,
			"DATE_OF_CONTACT":             formatContactDate(req.CreatedAt),
		},
	}); err != nil {
		return fmt.Errorf("send whitepaper admin notification: %w", err)
	}

	return nil
}

func whitePaperName(title, slug string, lang models.Lang) string {
	if title == "" {
		title = slug
	}

	return fmt.Sprintf("%s (%s)", title, lang)
}
