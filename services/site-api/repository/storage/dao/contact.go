package dao

import (
	"time"

	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type ContactSubmission struct {
	ID               string    `gorm:"column:id;primaryKey"`
	Name             string    `gorm:"column:name"`
	Surname          string    `gorm:"column:surname"`
	Email            string    `gorm:"column:email"`
	PhoneNumber      string    `gorm:"column:phone_number"`
	PreferredContact string    `gorm:"column:preferred_contact"`
	Company          string    `gorm:"column:company"`
	LinkedInProfile  string    `gorm:"column:linkedin_profile"`
	Message          string    `gorm:"column:message"`
	CreatedAt        time.Time `gorm:"column:created_at"`
	UpdatedAt        time.Time `gorm:"column:updated_at"`
}

func (ContactSubmission) TableName() string { return "contact_submissions" }

func FromContactSubmissionModel(m models.ContactSubmission) ContactSubmission {
	return ContactSubmission{
		ID:               m.ID,
		Name:             m.Name,
		Surname:          m.Surname,
		Email:            m.Email,
		PhoneNumber:      m.PhoneNumber,
		PreferredContact: string(m.PreferredContact),
		Company:          m.Company,
		LinkedInProfile:  m.LinkedInProfile,
		Message:          m.Message,
		CreatedAt:        m.CreatedAt,
		UpdatedAt:        m.UpdatedAt,
	}
}

func ToContactSubmissionModel(d ContactSubmission) models.ContactSubmission {
	return models.ContactSubmission{
		ID:               d.ID,
		Name:             d.Name,
		Surname:          d.Surname,
		Email:            d.Email,
		PhoneNumber:      d.PhoneNumber,
		PreferredContact: models.ContactPreference(d.PreferredContact),
		Company:          d.Company,
		LinkedInProfile:  d.LinkedInProfile,
		Message:          d.Message,
		CreatedAt:        d.CreatedAt,
		UpdatedAt:        d.UpdatedAt,
	}
}
