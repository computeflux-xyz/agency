package dtos

import (
	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type WhitePaperResp struct {
	ID          string   `json:"id"`
	Slug        string   `json:"slug"`
	Lang        string   `json:"lang"`
	Title       string   `json:"title"`
	Shortdesc   string   `json:"shortdesc"`
	Longdesc    string   `json:"longdesc"`
	Pages       int      `json:"pages"`
	Topics      []string `json:"topics"`
	Featured    bool     `json:"featured"`
	Langs       []string `json:"langs"`
	PublishDate string   `json:"publishDate,omitempty"`
	Gated       bool     `json:"gated"`
}

type WhitePaperLocaleSpecReq struct {
	Lang      string `json:"lang" binding:"required"`
	Title     string `json:"title" binding:"required"`
	Shortdesc string `json:"shortdesc"`
	Longdesc  string `json:"longdesc"`
	Pages     int    `json:"pages"`
	Filename  string `json:"filename" binding:"required"`
	SHA256    string `json:"sha256" binding:"required"`
	ByteSize  int64  `json:"byteSize" binding:"required"`
}

type WhitePaperIngestReq struct {
	Slug        string                    `json:"slug" binding:"required"`
	Topics      []string                  `json:"topics"`
	Featured    bool                      `json:"featured"`
	PublishDate string                    `json:"publishDate"`
	SourceDir   string                    `json:"sourceDir"`
	RequestedBy string                    `json:"requestedBy"`
	Locales     []WhitePaperLocaleSpecReq `json:"locales" binding:"required,min=1"`
}

type WhitePaperUploadResp struct {
	Lang   string `json:"lang"`
	Key    string `json:"key"`
	PutURL string `json:"putUrl"`
}

type WhitePaperIngestResp struct {
	Slug    string                 `json:"slug"`
	Uploads []WhitePaperUploadResp `json:"uploads"`
	Skipped []string               `json:"skipped"`
}

type WhitePaperCommitReq struct {
	Slug string `json:"slug" binding:"required"`
}

type WhitePaperRequestReq struct {
	Lang             string `json:"lang"`
	Name             string `json:"name" binding:"required"`
	Surname          string `json:"surname" binding:"required"`
	Email            string `json:"email" binding:"required,email"`
	PhoneNumber      string `json:"phoneNumber" binding:"required"`
	PreferredContact string `json:"preferredContact" binding:"required,oneof=phone email"`
	Company          string `json:"company"`
	LinkedInProfile  string `json:"linkedinProfile"`
	Message          string `json:"message"`
}

type WhitePaperRequestResp struct {
	ID   string `json:"id"`
	Lang string `json:"lang"`
	OK   bool   `json:"ok"`
}

func (r WhitePaperRequestReq) ToModel(slug string) models.WhitePaperRequest {
	return models.WhitePaperRequest{
		Slug:             slug,
		Lang:             models.ParseLang(r.Lang),
		Name:             r.Name,
		Surname:          r.Surname,
		Email:            r.Email,
		PhoneNumber:      r.PhoneNumber,
		PreferredContact: models.ContactPreference(r.PreferredContact),
		Company:          r.Company,
		LinkedInProfile:  r.LinkedInProfile,
		Message:          r.Message,
	}
}

func WhitePaperToResp(p models.WhitePaper, lang models.Lang) WhitePaperResp {
	resp := WhitePaperResp{
		ID:       p.ID,
		Slug:     p.Slug,
		Topics:   p.Topics,
		Featured: p.Featured,
		Gated:    true,
	}

	if resp.Topics == nil {
		resp.Topics = []string{}
	}

	for _, l := range p.Langs() {
		resp.Langs = append(resp.Langs, string(l))
	}

	if p.PublishDate != nil {
		resp.PublishDate = p.PublishDate.Format("2006-01-02")
	}

	if loc := p.Locale(lang); loc != nil {
		resp.Lang = string(loc.Lang)
		resp.Title = loc.Title
		resp.Shortdesc = loc.ShortDesc
		resp.Longdesc = loc.LongDesc
		resp.Pages = loc.Pages
	}

	return resp
}

func WhitePapersToResp(papers []models.WhitePaper, lang models.Lang) []WhitePaperResp {
	out := make([]WhitePaperResp, 0, len(papers))
	for _, p := range papers {
		out = append(out, WhitePaperToResp(p, lang))
	}

	return out
}
