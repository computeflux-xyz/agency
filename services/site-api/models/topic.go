package models

import "time"

// Topic is a curated taxonomy term (roughly the agency's service lines) that
// articles are tagged with and filtered by.
type Topic struct {
	ID          string
	Slug        string
	Name        string
	Description string
	SortOrder   int
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
