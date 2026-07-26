package dtos

import "github.com/computeflux-xyz/agency/services/site-api/models"

type ContactSubmitReq struct {
	Name             string `json:"name" binding:"required"`
	Surname          string `json:"surname" binding:"required"`
	Email            string `json:"email" binding:"required,email"`
	PhoneNumber      string `json:"phoneNumber" binding:"required"`
	PreferredContact string `json:"preferredContact" binding:"required,oneof=phone email"`
	Company          string `json:"company"`
	LinkedInProfile  string `json:"linkedinProfile"`
	Message          string `json:"message" binding:"required"`
}

type ContactSubmitResp struct {
	ID string `json:"id"`
	OK bool   `json:"ok"`
}

func (r ContactSubmitReq) ToModel() models.ContactSubmission {
	return models.ContactSubmission{
		Name:             r.Name,
		Surname:          r.Surname,
		Email:            r.Email,
		PhoneNumber:      r.PhoneNumber,
		PreferredContact: models.ContactPreference(r.PreferredContact),
		Company:          r.Company,
		LinkedInProfile:  r.LinkedInProfile,
		Message:          r.Message,
	}
}

func ContactToSubmitResp(sub models.ContactSubmission) ContactSubmitResp {
	return ContactSubmitResp{ID: sub.ID, OK: true}
}
