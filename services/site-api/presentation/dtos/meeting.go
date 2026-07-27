package dtos

import (
	"time"

	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type MeetingRequestReq struct {
	Name            string    `json:"name" binding:"required"`
	Surname         string    `json:"surname" binding:"required"`
	Email           string    `json:"email" binding:"required,email"`
	PhoneNumber     string    `json:"phoneNumber" binding:"required"`
	Company         string    `json:"company"`
	LinkedInProfile string    `json:"linkedinProfile"`
	StartDate       time.Time `json:"startDate" binding:"required"`
	EndDate         time.Time `json:"endDate" binding:"required"`
	Message         string    `json:"message" binding:"required"`
}

type MeetingRequestResp struct {
	ID string `json:"id"`
	OK bool   `json:"ok"`
}

func (r MeetingRequestReq) ToModel() models.MeetingRequest {
	return models.MeetingRequest{
		Name:            r.Name,
		Surname:         r.Surname,
		Email:           r.Email,
		PhoneNumber:     r.PhoneNumber,
		Company:         r.Company,
		LinkedInProfile: r.LinkedInProfile,
		StartDate:       r.StartDate,
		EndDate:         r.EndDate,
		Message:         r.Message,
	}
}

func MeetingToRequestResp(req models.MeetingRequest) MeetingRequestResp {
	return MeetingRequestResp{ID: req.ID, OK: true}
}
