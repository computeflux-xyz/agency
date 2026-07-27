package meeting

import (
	"context"
	"strings"
	"time"

	"github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	errorx "github.com/computeflux-xyz/agency/services/site-api/application/error"
	"github.com/computeflux-xyz/agency/services/site-api/models"
	"github.com/sirupsen/logrus"
)

type RequestUseCase struct {
	store  contracts.MeetingStorage
	mailer contracts.MeetingMailer
	log    *logrus.Logger
}

func NewRequestUseCase(store contracts.MeetingStorage, mailer contracts.MeetingMailer, log *logrus.Logger) *RequestUseCase {
	return &RequestUseCase{store: store, mailer: mailer, log: log}
}

func (uc *RequestUseCase) Submit(ctx context.Context, req models.MeetingRequest) (*models.MeetingRequest, error) {
	req = normalizeMeeting(req)
	if err := validateMeeting(req); err != nil {
		return nil, err
	}

	if err := uc.store.CreateMeetingRequest(ctx, &req); err != nil {
		return nil, err
	}

	if err := uc.mailer.SendAcknowledgement(ctx, req); err != nil {
		uc.log.WithError(err).WithField("meeting_request_id", req.ID).Error("meeting acknowledgement email failed")
	}

	if err := uc.mailer.SendAdminNotification(ctx, req); err != nil {
		uc.log.WithError(err).WithField("meeting_request_id", req.ID).Error("meeting admin notification email failed")
	}

	return &req, nil
}

func normalizeMeeting(req models.MeetingRequest) models.MeetingRequest {
	req.Name = strings.TrimSpace(req.Name)
	req.Surname = strings.TrimSpace(req.Surname)
	req.Email = strings.TrimSpace(req.Email)
	req.PhoneNumber = strings.TrimSpace(req.PhoneNumber)
	req.Company = strings.TrimSpace(req.Company)
	req.LinkedInProfile = strings.TrimSpace(req.LinkedInProfile)
	req.Message = strings.TrimSpace(req.Message)
	return req
}

func validateMeeting(req models.MeetingRequest) error {
	fields := map[string]string{}
	if req.Name == "" {
		fields["name"] = "name is required"
	}

	if req.Surname == "" {
		fields["surname"] = "surname is required"
	}

	if req.Email == "" {
		fields["email"] = "email is required"
	}

	if req.PhoneNumber == "" {
		fields["phoneNumber"] = "phone number is required"
	}

	if req.Message == "" {
		fields["message"] = "message is required"
	}

	if req.StartDate.IsZero() {
		fields["startDate"] = "start date is required"
	}

	if req.EndDate.IsZero() {
		fields["endDate"] = "end date is required"
	}

	if !req.StartDate.IsZero() && !req.EndDate.IsZero() && !req.EndDate.After(req.StartDate) {
		fields["endDate"] = "end date must be after start date"
	}

	if !req.StartDate.IsZero() && req.StartDate.Before(time.Now().Add(-1*time.Hour)) {
		fields["startDate"] = "start date must be in the future"
	}

	if len(fields) > 0 {
		return errorx.NewValidation("invalid meeting request", fields)
	}

	return nil
}
