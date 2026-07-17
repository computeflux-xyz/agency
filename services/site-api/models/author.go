package models

import "time"

type Author struct {
	ID        string
	Slug      string
	Name      string
	Title     string
	Bio       string
	AvatarURL string
	Links     map[string]string
	CreatedAt time.Time
	UpdatedAt time.Time
}
