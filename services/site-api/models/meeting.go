package models

import "time"

type MeetingRequest struct {
	ID              string
	Name            string
	Surname         string
	Email           string
	PhoneNumber     string
	Company         string
	LinkedInProfile string
	Message         string
	StartDate       time.Time
	EndDate         time.Time
	CreatedAt       time.Time
	UpdatedAt       time.Time
}
