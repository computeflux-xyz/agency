package storage

import (
	"context"
	"errors"
	"time"

	"github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	errorx "github.com/computeflux-xyz/agency/services/site-api/application/error"
	"github.com/computeflux-xyz/agency/services/site-api/models"
	"github.com/computeflux-xyz/agency/services/site-api/repository/storage/dao"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type whitePaperStorage struct {
	db *gorm.DB
}

func NewWhitePaperStorage(db *gorm.DB) *whitePaperStorage {
	return &whitePaperStorage{db: db}
}

func (s *whitePaperStorage) ListPublished(ctx context.Context, f contracts.WhitePaperListFilter) ([]models.WhitePaper, error) {
	q := s.db.WithContext(ctx).
		Model(&dao.WhitePaper{}).
		Where("status = ?", string(models.WhitePaperStatusPublished)).
		Preload("Locales", func(db *gorm.DB) *gorm.DB {
			return db.Where("published_at IS NOT NULL").Order("lang ASC")
		}).
		Order("featured DESC, publish_date DESC NULLS LAST, slug ASC")

	if f.Featured != nil {
		q = q.Where("featured = ?", *f.Featured)
	}

	var rows []dao.WhitePaper
	if err := q.Find(&rows).Error; err != nil {
		return nil, errorx.NewInternal("list whitepapers", err)
	}

	out := make([]models.WhitePaper, 0, len(rows))
	for _, row := range rows {
		if len(row.Locales) == 0 {
			continue
		}

		out = append(out, dao.ToWhitePaperModel(row))
	}

	return out, nil
}

func (s *whitePaperStorage) GetPublishedBySlug(ctx context.Context, slug string) (*models.WhitePaper, error) {
	var row dao.WhitePaper
	tx := s.db.WithContext(ctx).
		Where("slug = ? AND status = ?", slug, string(models.WhitePaperStatusPublished)).
		Preload("Locales", func(db *gorm.DB) *gorm.DB {
			return db.Where("published_at IS NOT NULL").Order("lang ASC")
		}).
		Limit(1).
		Find(&row)
	if tx.Error != nil {
		return nil, errorx.NewInternal("get whitepaper", tx.Error)
	}

	if tx.RowsAffected == 0 {
		return nil, nil
	}

	if len(row.Locales) == 0 {
		return nil, nil
	}

	paper := dao.ToWhitePaperModel(row)
	return &paper, nil
}

func (s *whitePaperStorage) GetDraft(ctx context.Context, slug string) (*models.WhitePaper, error) {
	var row dao.WhitePaper
	err := s.db.WithContext(ctx).
		Where("slug = ?", slug).
		Preload("Locales", func(db *gorm.DB) *gorm.DB { return db.Order("lang ASC") }).
		First(&row).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errorx.NewNotFound("whitepaper %q not found", slug)
	}

	if err != nil {
		return nil, errorx.NewInternal("get whitepaper draft", err)
	}

	paper := dao.ToWhitePaperModel(row)
	return &paper, nil
}

func (s *whitePaperStorage) UpsertWhitePaper(ctx context.Context, paper *models.WhitePaper) (*models.WhitePaper, error) {
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		row := dao.FromWhitePaperModel(*paper)
		if row.ID == "" {
			row.ID = uuid.NewString()
		}

		if err := tx.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "slug"}},
			DoUpdates: clause.AssignmentColumns([]string{
				"status", "featured", "topics", "publish_date", "source_dir", "updated_at",
			}),
		}).Create(&row).Error; err != nil {
			return mapWriteError(err, "whitepaper")
		}

		var stored dao.WhitePaper
		if err := tx.Where("slug = ?", paper.Slug).First(&stored).Error; err != nil {
			return mapWriteError(err, "whitepaper")
		}

		for _, loc := range paper.Locales {
			locRow := dao.FromWhitePaperLocaleModel(stored.ID, loc)
			if locRow.ID == "" {
				locRow.ID = uuid.NewString()
			}

			if err := tx.Clauses(clause.OnConflict{
				Columns: []clause.Column{{Name: "whitepaper_id"}, {Name: "lang"}},
				DoUpdates: clause.AssignmentColumns([]string{
					"title", "shortdesc", "longdesc", "pages", "filename",
					"r2_key", "sha256", "byte_size", "updated_at",
				}),
			}).Create(&locRow).Error; err != nil {
				return mapWriteError(err, "whitepaper locale")
			}
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return s.GetDraft(ctx, paper.Slug)
}

func (s *whitePaperStorage) PublishWhitePaper(ctx context.Context, slug string, langs []models.Lang) (*models.WhitePaper, error) {
	if len(langs) == 0 {
		return nil, errorx.NewBadRequest("no edition to publish")
	}

	now := time.Now().UTC()
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var row dao.WhitePaper
		if err := tx.Where("slug = ?", slug).First(&row).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errorx.NewNotFound("whitepaper %q not found", slug)
			}

			return mapWriteError(err, "whitepaper")
		}

		codes := make([]string, len(langs))
		for i, l := range langs {
			codes[i] = string(l)
		}

		if err := tx.Model(&dao.WhitePaperLocale{}).
			Where("whitepaper_id = ? AND lang IN ?", row.ID, codes).
			Update("published_at", now).Error; err != nil {
			return mapWriteError(err, "whitepaper locale")
		}

		if err := tx.Model(&dao.WhitePaper{}).
			Where("id = ?", row.ID).
			Update("status", string(models.WhitePaperStatusPublished)).Error; err != nil {
			return mapWriteError(err, "whitepaper")
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return s.GetPublishedBySlug(ctx, slug)
}

func (s *whitePaperStorage) DeleteWhitePaper(ctx context.Context, slug string) ([]string, error) {
	var keys []string
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var row dao.WhitePaper
		if err := tx.Where("slug = ?", slug).Preload("Locales").First(&row).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errorx.NewNotFound("whitepaper %q not found", slug)
			}

			return mapWriteError(err, "whitepaper")
		}

		for _, loc := range row.Locales {
			keys = append(keys, loc.R2Key)
		}

		if err := tx.Delete(&dao.WhitePaper{}, "id = ?", row.ID).Error; err != nil {
			return mapWriteError(err, "whitepaper")
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return keys, nil
}

func (s *whitePaperStorage) CreateRequest(ctx context.Context, req *models.WhitePaperRequest) error {
	if req.ID == "" {
		req.ID = uuid.NewString()
	}

	row := dao.FromWhitePaperRequestModel(*req)
	if err := s.db.WithContext(ctx).Create(&row).Error; err != nil {
		return mapWriteError(err, "whitepaper request")
	}

	*req = dao.ToWhitePaperRequestModel(row)
	return nil
}

func (s *whitePaperStorage) MarkRequestDelivered(ctx context.Context, id string, status models.WhitePaperDeliveryStatus, failure string) error {
	updates := map[string]any{
		"delivery_status": string(status),
		"delivery_error":  failure,
	}
	if status == models.WhitePaperDeliverySent {
		updates["delivered_at"] = time.Now().UTC()
	}

	if err := s.db.WithContext(ctx).
		Model(&dao.WhitePaperRequest{}).
		Where("id = ?", id).
		Updates(updates).Error; err != nil {
		return mapWriteError(err, "whitepaper request")
	}

	return nil
}
