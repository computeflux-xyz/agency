package models

import "time"

// ContactPreference is the channel a contact would like to be reached back on.
type ContactPreference string

const (
	ContactPreferencePhone ContactPreference = "phone"
	ContactPreferenceEmail ContactPreference = "email"
)

func (p ContactPreference) Valid() bool {
	return p == ContactPreferencePhone || p == ContactPreferenceEmail
}

// ContactSubmission is a single "Contact us" enquiry from the marketing site.
type ContactSubmission struct {
	ID               string
	Name             string
	Surname          string
	Email            string
	PhoneNumber      string
	PreferredContact ContactPreference
	Company          string
	LinkedInProfile  string
	Message          string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
