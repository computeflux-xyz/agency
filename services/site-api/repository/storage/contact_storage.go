package storage

import (
	"context"

	"github.com/computeflux-xyz/agency/services/site-api/models"
	"github.com/computeflux-xyz/agency/services/site-api/repository/storage/dao"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type contactStorage struct {
	db *gorm.DB
}

func NewContactStorage(db *gorm.DB) *contactStorage {
	return &contactStorage{db: db}
}

// CreateSubmission persists a contact submission. It assigns an id when one is
// not already set and writes the stored row (id + timestamps) back onto sub.
func (s *contactStorage) CreateSubmission(ctx context.Context, sub *models.ContactSubmission) error {
	if sub.ID == "" {
		sub.ID = uuid.NewString()
	}

	row := dao.FromContactSubmissionModel(*sub)
	if err := s.db.WithContext(ctx).Create(&row).Error; err != nil {
		return mapWriteError(err, "contact submission")
	}

	*sub = dao.ToContactSubmissionModel(row)
	return nil
}
