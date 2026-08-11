package whitepapers

import (
	"context"
	"strings"

	"github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	errorx "github.com/computeflux-xyz/agency/services/site-api/application/error"
	"github.com/computeflux-xyz/agency/services/site-api/models"
	"github.com/sirupsen/logrus"
)

type RequestUseCase struct {
	read   contracts.WhitePaperReadStorage
	write  contracts.WhitePaperWriteStorage
	blobs  contracts.BlobStore
	mailer contracts.WhitePaperMailer
	log    *logrus.Logger
}

func NewRequestUseCase(
	read contracts.WhitePaperReadStorage,
	write contracts.WhitePaperWriteStorage,
	blobs contracts.BlobStore,
	mailer contracts.WhitePaperMailer,
	log *logrus.Logger,
) *RequestUseCase {
	return &RequestUseCase{read: read, write: write, blobs: blobs, mailer: mailer, log: log}
}

func (uc *RequestUseCase) Submit(ctx context.Context, req models.WhitePaperRequest) (*models.WhitePaperRequest, error) {
	req = normalize(req)
	if err := validateRequest(req); err != nil {
		return nil, err
	}

	paper, err := uc.read.GetPublishedBySlug(ctx, req.Slug)
	if err != nil {
		return nil, err
	}

	if paper == nil {
		return nil, errorx.NewNotFound("whitepaper %q not found", req.Slug)
	}

	locale := paper.Locale(req.Lang)
	if locale == nil {
		return nil, errorx.NewNotFound("whitepaper %q has no published edition", req.Slug)
	}

	req.Lang = locale.Lang
	req.WhitePaperID = paper.ID
	req.DeliveryStatus = models.WhitePaperDeliveryPending

	if err := uc.write.CreateRequest(ctx, &req); err != nil {
		return nil, err
	}

	pdf, err := uc.blobs.GetObject(ctx, locale.R2Key)
	if err != nil {
		uc.fail(ctx, req.ID, "could not read the document from storage: "+err.Error())
		return nil, errorx.NewExternal(errorx.CodeExternalService, "the document could not be retrieved", err)
	}

	if err := uc.mailer.SendDocument(ctx, req, contracts.WhitePaperAttachment{
		Filename: locale.Filename,
		Content:  pdf,
	}); err != nil {
		uc.fail(ctx, req.ID, "delivery email failed: "+err.Error())
		return nil, errorx.NewExternal(errorx.CodeExternalService, "the document could not be sent", err)
	}

	if err := uc.write.MarkRequestDelivered(ctx, req.ID, models.WhitePaperDeliverySent, ""); err != nil {
		uc.log.WithError(err).WithField("request_id", req.ID).Error("could not mark whitepaper request delivered")
	}

	req.DeliveryStatus = models.WhitePaperDeliverySent

	if err := uc.mailer.SendAdminNotification(ctx, req, locale.Title); err != nil {
		uc.log.WithError(err).WithField("request_id", req.ID).Error("whitepaper admin notification email failed")
	}

	return &req, nil
}

func (uc *RequestUseCase) fail(ctx context.Context, id, reason string) {
	uc.log.WithField("request_id", id).Error(reason)
	if err := uc.write.MarkRequestDelivered(ctx, id, models.WhitePaperDeliveryFailed, reason); err != nil {
		uc.log.WithError(err).WithField("request_id", id).Error("could not mark whitepaper request failed")
	}
}

func normalize(req models.WhitePaperRequest) models.WhitePaperRequest {
	req.Slug = strings.TrimSpace(req.Slug)
	req.Name = strings.TrimSpace(req.Name)
	req.Surname = strings.TrimSpace(req.Surname)
	req.Email = strings.TrimSpace(req.Email)
	req.PhoneNumber = strings.TrimSpace(req.PhoneNumber)
	req.Company = strings.TrimSpace(req.Company)
	req.LinkedInProfile = strings.TrimSpace(req.LinkedInProfile)
	req.Message = strings.TrimSpace(req.Message)
	if !req.Lang.Valid() {
		req.Lang = models.LangDefault
	}

	return req
}

func validateRequest(req models.WhitePaperRequest) error {
	fields := map[string]string{}
	if !slugPattern.MatchString(req.Slug) {
		fields["slug"] = "must be a lowercase kebab-case slug"
	}

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

	if !req.PreferredContact.Valid() {
		fields["preferredContact"] = "preferred contact must be 'phone' or 'email'"
	}

	if len(fields) > 0 {
		return errorx.NewValidation("invalid whitepaper request", fields)
	}

	return nil
}
