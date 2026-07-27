package email

import (
	"context"
	"fmt"

	"github.com/computeflux-xyz/agency/services/site-api/models"
	"github.com/computeflux-xyz/base-go/mailer"
)

type MeetingConfig struct {
	AdminEmail             string
	RequestTemplateID      string
	RequestAdminTemplateID string
	ReplyLinkedIn          string
	ReplyPersonalEmail     string
	ReplyPhone             string
}

type ResendMeetingMailer struct {
	mailer mailer.TemplateMailer
	cfg    MeetingConfig
}

func NewResendMeetingMailer(m mailer.TemplateMailer, cfg MeetingConfig) *ResendMeetingMailer {
	return &ResendMeetingMailer{mailer: m, cfg: cfg}
}

func (m *ResendMeetingMailer) SendAcknowledgement(ctx context.Context, req models.MeetingRequest) error {
	if _, err := m.mailer.SendTemplate(ctx, mailer.SendTemplateRequest{
		To:         []string{req.Email},
		TemplateID: m.cfg.RequestTemplateID,
		Variables: map[string]interface{}{
			"SURNAME":                req.Surname,
			"START_DATE_FOR_MEETING": formatContactDate(req.StartDate),
			"END_DATE_FOR_MEETING":   formatContactDate(req.EndDate),
			"LINKEDIN_LINK":          m.cfg.ReplyLinkedIn,
			"PERSONNAL_MAIL_LINK":    m.cfg.ReplyPersonalEmail,
			"PHONE_NUMBER":           m.cfg.ReplyPhone,
		},
	}); err != nil {
		return fmt.Errorf("send meeting acknowledgement: %w", err)
	}

	return nil
}

func (m *ResendMeetingMailer) SendAdminNotification(ctx context.Context, req models.MeetingRequest) error {
	if _, err := m.mailer.SendTemplate(ctx, mailer.SendTemplateRequest{
		To:         []string{m.cfg.AdminEmail},
		ReplyTo:    req.Email,
		TemplateID: m.cfg.RequestAdminTemplateID,
		Variables: map[string]interface{}{
			"NAME":                     req.Name,
			"SURNAME":                  req.Surname,
			"CONTACT_EMAIL":            req.Email,
			"CONTACT_PHONE_NUMBER":     req.PhoneNumber,
			"CONTACT_COMPANY":          req.Company,
			"CONTACT_LINKEDIN_PROFILE": req.LinkedInProfile,
			"START_DATE_FOR_MEETING":   formatContactDate(req.StartDate),
			"END_DATE_FOR_MEETING":     formatContactDate(req.EndDate),
			"MESSAGE":                  req.Message,
			"DATE_OF_CONTACT":          formatContactDate(req.CreatedAt),
		},
	}); err != nil {
		return fmt.Errorf("send meeting admin notification: %w", err)
	}

	return nil
}
