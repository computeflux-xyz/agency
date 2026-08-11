package dao

import (
	"time"

	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type WhitePaper struct {
	ID          string               `gorm:"column:id;primaryKey"`
	Slug        string               `gorm:"column:slug"`
	Status      string               `gorm:"column:status"`
	Featured    bool                 `gorm:"column:featured"`
	Topics      JSONColumn[[]string] `gorm:"column:topics;type:jsonb"`
	PublishDate *time.Time           `gorm:"column:publish_date"`
	SourceDir   string               `gorm:"column:source_dir"`
	CreatedAt   time.Time            `gorm:"column:created_at"`
	UpdatedAt   time.Time            `gorm:"column:updated_at"`

	Locales []WhitePaperLocale `gorm:"foreignKey:WhitePaperID;references:ID"`
}

func (WhitePaper) TableName() string { return "whitepapers" }

type WhitePaperLocale struct {
	ID           string     `gorm:"column:id;primaryKey"`
	WhitePaperID string     `gorm:"column:whitepaper_id"`
	Lang         string     `gorm:"column:lang"`
	Title        string     `gorm:"column:title"`
	ShortDesc    string     `gorm:"column:shortdesc"`
	LongDesc     string     `gorm:"column:longdesc"`
	Pages        int        `gorm:"column:pages"`
	Filename     string     `gorm:"column:filename"`
	R2Key        string     `gorm:"column:r2_key"`
	SHA256       string     `gorm:"column:sha256"`
	ByteSize     int64      `gorm:"column:byte_size"`
	PublishedAt  *time.Time `gorm:"column:published_at"`
	CreatedAt    time.Time  `gorm:"column:created_at"`
	UpdatedAt    time.Time  `gorm:"column:updated_at"`
}

func (WhitePaperLocale) TableName() string { return "whitepaper_locales" }

type WhitePaperRequest struct {
	ID               string     `gorm:"column:id;primaryKey"`
	WhitePaperID     *string    `gorm:"column:whitepaper_id"`
	Slug             string     `gorm:"column:slug"`
	Lang             string     `gorm:"column:lang"`
	Name             string     `gorm:"column:name"`
	Surname          string     `gorm:"column:surname"`
	Email            string     `gorm:"column:email"`
	PhoneNumber      string     `gorm:"column:phone_number"`
	PreferredContact string     `gorm:"column:preferred_contact"`
	Company          string     `gorm:"column:company"`
	LinkedInProfile  string     `gorm:"column:linkedin_profile"`
	Message          string     `gorm:"column:message"`
	DeliveryStatus   string     `gorm:"column:delivery_status"`
	DeliveryError    string     `gorm:"column:delivery_error"`
	DeliveredAt      *time.Time `gorm:"column:delivered_at"`
	CreatedAt        time.Time  `gorm:"column:created_at"`
	UpdatedAt        time.Time  `gorm:"column:updated_at"`
}

func (WhitePaperRequest) TableName() string { return "whitepaper_requests" }

func FromWhitePaperModel(m models.WhitePaper) WhitePaper {
	topics := m.Topics
	if topics == nil {
		topics = []string{}
	}

	return WhitePaper{
		ID:          m.ID,
		Slug:        m.Slug,
		Status:      string(m.Status),
		Featured:    m.Featured,
		Topics:      NewJSONColumn(topics),
		PublishDate: m.PublishDate,
		SourceDir:   m.SourceDir,
	}
}

func FromWhitePaperLocaleModel(paperID string, m models.WhitePaperLocale) WhitePaperLocale {
	return WhitePaperLocale{
		ID:           m.ID,
		WhitePaperID: paperID,
		Lang:         string(m.Lang),
		Title:        m.Title,
		ShortDesc:    m.ShortDesc,
		LongDesc:     m.LongDesc,
		Pages:        m.Pages,
		Filename:     m.Filename,
		R2Key:        m.R2Key,
		SHA256:       m.SHA256,
		ByteSize:     m.ByteSize,
		PublishedAt:  m.PublishedAt,
	}
}

func ToWhitePaperModel(d WhitePaper) models.WhitePaper {
	out := models.WhitePaper{
		ID:          d.ID,
		Slug:        d.Slug,
		Status:      models.WhitePaperStatus(d.Status),
		Featured:    d.Featured,
		Topics:      d.Topics.Val,
		PublishDate: d.PublishDate,
		SourceDir:   d.SourceDir,
		CreatedAt:   d.CreatedAt,
		UpdatedAt:   d.UpdatedAt,
	}

	for _, l := range d.Locales {
		out.Locales = append(out.Locales, ToWhitePaperLocaleModel(l))
	}

	return out
}

func ToWhitePaperLocaleModel(d WhitePaperLocale) models.WhitePaperLocale {
	return models.WhitePaperLocale{
		ID:          d.ID,
		Lang:        models.Lang(d.Lang),
		Title:       d.Title,
		ShortDesc:   d.ShortDesc,
		LongDesc:    d.LongDesc,
		Pages:       d.Pages,
		Filename:    d.Filename,
		R2Key:       d.R2Key,
		SHA256:      d.SHA256,
		ByteSize:    d.ByteSize,
		PublishedAt: d.PublishedAt,
		CreatedAt:   d.CreatedAt,
		UpdatedAt:   d.UpdatedAt,
	}
}

func FromWhitePaperRequestModel(m models.WhitePaperRequest) WhitePaperRequest {
	var paperID *string
	if m.WhitePaperID != "" {
		id := m.WhitePaperID
		paperID = &id
	}

	return WhitePaperRequest{
		ID:               m.ID,
		WhitePaperID:     paperID,
		Slug:             m.Slug,
		Lang:             string(m.Lang),
		Name:             m.Name,
		Surname:          m.Surname,
		Email:            m.Email,
		PhoneNumber:      m.PhoneNumber,
		PreferredContact: string(m.PreferredContact),
		Company:          m.Company,
		LinkedInProfile:  m.LinkedInProfile,
		Message:          m.Message,
		DeliveryStatus:   string(m.DeliveryStatus),
		DeliveryError:    m.DeliveryError,
		DeliveredAt:      m.DeliveredAt,
		CreatedAt:        m.CreatedAt,
		UpdatedAt:        m.UpdatedAt,
	}
}

func ToWhitePaperRequestModel(d WhitePaperRequest) models.WhitePaperRequest {
	paperID := ""
	if d.WhitePaperID != nil {
		paperID = *d.WhitePaperID
	}

	return models.WhitePaperRequest{
		ID:               d.ID,
		WhitePaperID:     paperID,
		Slug:             d.Slug,
		Lang:             models.Lang(d.Lang),
		Name:             d.Name,
		Surname:          d.Surname,
		Email:            d.Email,
		PhoneNumber:      d.PhoneNumber,
		PreferredContact: models.ContactPreference(d.PreferredContact),
		Company:          d.Company,
		LinkedInProfile:  d.LinkedInProfile,
		Message:          d.Message,
		DeliveryStatus:   models.WhitePaperDeliveryStatus(d.DeliveryStatus),
		DeliveryError:    d.DeliveryError,
		DeliveredAt:      d.DeliveredAt,
		CreatedAt:        d.CreatedAt,
		UpdatedAt:        d.UpdatedAt,
	}
}
