package email

import (
	"context"
	"fmt"
	"time"

	"github.com/computeflux-xyz/agency/services/site-api/models"
	"github.com/computeflux-xyz/base-go/mailer"
)

type Config struct {
	AdminEmail                  string
	FirstContactTemplateID      string
	FirstContactAdminTemplateID string
}

type ResendContactMailer struct {
	mailer mailer.TemplateMailer
	cfg    Config
}

func NewResendContactMailer(m mailer.TemplateMailer, cfg Config) *ResendContactMailer {
	return &ResendContactMailer{mailer: m, cfg: cfg}
}

// SendAcknowledgement confirms to the contact that we received their message
func (m *ResendContactMailer) SendAcknowledgement(ctx context.Context, sub models.ContactSubmission) error {
	if _, err := m.mailer.SendTemplate(ctx, mailer.SendTemplateRequest{
		To:         []string{sub.Email},
		TemplateID: m.cfg.FirstContactTemplateID,
		Variables: map[string]interface{}{
			"SURNAME":                     sub.Surname,
			"PREFERRED_COMMUNICATION_WAY": acknowledgementPreferredWay(sub.PreferredContact),
		},
	}); err != nil {
		return fmt.Errorf("send acknowledgement: %w", err)
	}

	return nil
}

// SendAdminNotification alerts the team about a new contact request.
// The contact's address is set as reply-to so the team can answer them directly.
func (m *ResendContactMailer) SendAdminNotification(ctx context.Context, sub models.ContactSubmission) error {
	if _, err := m.mailer.SendTemplate(ctx, mailer.SendTemplateRequest{
		To:         []string{m.cfg.AdminEmail},
		ReplyTo:    sub.Email,
		TemplateID: m.cfg.FirstContactAdminTemplateID,
		Variables: map[string]interface{}{
			"NAME":                        sub.Name,
			"SURNAME":                     sub.Surname,
			"CONTACT_EMAIL":               sub.Email,
			"CONTACT_PHONE_NUMBER":        sub.PhoneNumber,
			"CONTACT_COMPANY":             sub.Company,
			"CONTACT_LINKEDIN_PROFILE":    sub.LinkedInProfile,
			"PREFERRED_COMMUNICATION_WAY": string(sub.PreferredContact),
			"MESSAGE":                     sub.Message,
			"DATE_OF_CONTACT":             formatContactDate(sub.CreatedAt),
		},
	}); err != nil {
		return fmt.Errorf("send admin notification: %w", err)
	}

	return nil
}

// acknowledgementPreferredWay renders the French phrase the acknowledgement
// template expects for the contact's chosen channel.
func acknowledgementPreferredWay(p models.ContactPreference) string {
	if p == models.ContactPreferencePhone {
		return "un appel téléphonique de notre part"
	}

	return "un mail conversationnel de notre part"
}

func formatContactDate(t time.Time) string {
	if t.IsZero() {
		t = time.Now()
	}

	return t.UTC().Format("02/01/2006 15:04 MST")
}
