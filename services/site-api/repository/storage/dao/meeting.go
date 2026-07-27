package dao

import (
	"time"

	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type MeetingRequest struct {
	ID              string    `gorm:"column:id;primaryKey"`
	Name            string    `gorm:"column:name"`
	Surname         string    `gorm:"column:surname"`
	Email           string    `gorm:"column:email"`
	PhoneNumber     string    `gorm:"column:phone_number"`
	Company         string    `gorm:"column:company"`
	LinkedInProfile string    `gorm:"column:linkedin_profile"`
	Message         string    `gorm:"column:message"`
	StartDate       time.Time `gorm:"column:start_date"`
	EndDate         time.Time `gorm:"column:end_date"`
	CreatedAt       time.Time `gorm:"column:created_at"`
	UpdatedAt       time.Time `gorm:"column:updated_at"`
}

func (MeetingRequest) TableName() string { return "meeting_requests" }

func FromMeetingRequestModel(m models.MeetingRequest) MeetingRequest {
	return MeetingRequest{
		ID:              m.ID,
		Name:            m.Name,
		Surname:         m.Surname,
		Email:           m.Email,
		PhoneNumber:     m.PhoneNumber,
		Company:         m.Company,
		LinkedInProfile: m.LinkedInProfile,
		Message:         m.Message,
		StartDate:       m.StartDate,
		EndDate:         m.EndDate,
		CreatedAt:       m.CreatedAt,
		UpdatedAt:       m.UpdatedAt,
	}
}

func ToMeetingRequestModel(d MeetingRequest) models.MeetingRequest {
	return models.MeetingRequest{
		ID:              d.ID,
		Name:            d.Name,
		Surname:         d.Surname,
		Email:           d.Email,
		PhoneNumber:     d.PhoneNumber,
		Company:         d.Company,
		LinkedInProfile: d.LinkedInProfile,
		Message:         d.Message,
		StartDate:       d.StartDate,
		EndDate:         d.EndDate,
		CreatedAt:       d.CreatedAt,
		UpdatedAt:       d.UpdatedAt,
	}
}
