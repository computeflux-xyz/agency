package models

import "time"

type WhitePaperStatus string

const (
	WhitePaperStatusDraft     WhitePaperStatus = "draft"
	WhitePaperStatusPublished WhitePaperStatus = "published"
)

type WhitePaper struct {
	ID          string
	Slug        string
	Status      WhitePaperStatus
	Featured    bool
	Topics      []string
	PublishDate *time.Time
	SourceDir   string
	Locales     []WhitePaperLocale
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (w WhitePaper) Locale(lang Lang) *WhitePaperLocale {
	if l := w.findLocale(lang); l != nil {
		return l
	}

	if l := w.findLocale(LangDefault); l != nil {
		return l
	}

	if len(w.Locales) > 0 {
		return &w.Locales[0]
	}

	return nil
}

func (w WhitePaper) Langs() []Lang {
	out := make([]Lang, 0, len(w.Locales))
	for _, l := range w.Locales {
		out = append(out, l.Lang)
	}

	return out
}

func (w WhitePaper) findLocale(lang Lang) *WhitePaperLocale {
	for i := range w.Locales {
		if w.Locales[i].Lang == lang {
			return &w.Locales[i]
		}
	}

	return nil
}

type WhitePaperLocale struct {
	ID          string
	Lang        Lang
	Title       string
	ShortDesc   string
	LongDesc    string
	Pages       int
	Filename    string
	R2Key       string
	SHA256      string
	ByteSize    int64
	PublishedAt *time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type WhitePaperDeliveryStatus string

const (
	WhitePaperDeliveryPending WhitePaperDeliveryStatus = "pending"
	WhitePaperDeliverySent    WhitePaperDeliveryStatus = "sent"
	WhitePaperDeliveryFailed  WhitePaperDeliveryStatus = "failed"
)

type WhitePaperRequest struct {
	ID               string
	WhitePaperID     string
	Slug             string
	Lang             Lang
	Name             string
	Surname          string
	Email            string
	PhoneNumber      string
	PreferredContact ContactPreference
	Company          string
	LinkedInProfile  string
	Message          string
	DeliveryStatus   WhitePaperDeliveryStatus
	DeliveryError    string
	DeliveredAt      *time.Time
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
