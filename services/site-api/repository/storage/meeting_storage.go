package storage

import (
	"context"

	"github.com/computeflux-xyz/agency/services/site-api/models"
	"github.com/computeflux-xyz/agency/services/site-api/repository/storage/dao"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type meetingStorage struct {
	db *gorm.DB
}

func NewMeetingStorage(db *gorm.DB) *meetingStorage {
	return &meetingStorage{db: db}
}

func (s *meetingStorage) CreateMeetingRequest(ctx context.Context, req *models.MeetingRequest) error {
	if req.ID == "" {
		req.ID = uuid.NewString()
	}

	row := dao.FromMeetingRequestModel(*req)
	if err := s.db.WithContext(ctx).Create(&row).Error; err != nil {
		return mapWriteError(err, "meeting request")
	}

	*req = dao.ToMeetingRequestModel(row)
	return nil
}
