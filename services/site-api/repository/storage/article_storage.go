package storage

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	errorx "github.com/computeflux-xyz/agency/services/site-api/application/error"
	"github.com/computeflux-xyz/agency/services/site-api/models"
	"github.com/computeflux-xyz/agency/services/site-api/repository/storage/dao"
	"github.com/computeflux-xyz/base-go/database"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type articleStorage struct {
	db *gorm.DB
}

func NewArticleStorage(db *gorm.DB) *articleStorage {
	return &articleStorage{db: db}
}

func (s *articleStorage) ListArticles(ctx context.Context, f contracts.ArticleListFilter) (contracts.ArticleListResult, error) {
	var result contracts.ArticleListResult
	page := f.Pagination.Normalized()

	var total int64
	if err := s.filtered(ctx, f, true).Count(&total).Error; err != nil {
		return result, errorx.NewInternal("count articles", err)
	}

	result.Total = total
	typeCounts := []struct {
		Type string
		Cnt  int64
	}{}
	if err := s.filtered(ctx, f, false).
		Select("articles.type AS type, count(*) AS cnt").
		Group("articles.type").
		Scan(&typeCounts).Error; err != nil {
		return result, errorx.NewInternal("count articles by type", err)
	}

	for _, tc := range typeCounts {
		switch models.ArticleType(tc.Type) {
		case models.ArticleTypeBlog:
			result.TotalBlog = tc.Cnt
		case models.ArticleTypeStudy:
			result.TotalStudy = tc.Cnt
		}
	}

	var rows []dao.Article
	q := s.applyOrder(s.filtered(ctx, f, true), f.Sort)
	if err := q.Offset(page.Offset()).Limit(page.Limit()).Find(&rows).Error; err != nil {
		return result, errorx.NewInternal("list articles", err)
	}

	articles := make([]models.Article, len(rows))
	ids := make([]string, len(rows))
	for i, r := range rows {
		articles[i] = dao.ToArticleModel(r)
		ids[i] = r.ID
	}

	if err := s.attachTopics(ctx, articles, ids); err != nil {
		return result, err
	}

	result.Articles = articles
	return result, nil
}

func (s *articleStorage) filtered(ctx context.Context, f contracts.ArticleListFilter, includeType bool) *gorm.DB {
	status := f.Status
	if status == "" {
		status = models.ArticleStatusPublished
	}

	q := s.db.WithContext(ctx).Model(&dao.Article{}).Where("articles.status = ?", string(status))
	if includeType && len(f.Types) > 0 {
		types := make([]string, len(f.Types))
		for i, t := range f.Types {
			types[i] = string(t)
		}

		q = q.Where("articles.type IN ?", types)
	}

	if f.Featured != nil {
		q = q.Where("articles.featured = ?", *f.Featured)
	}

	if strings.TrimSpace(f.Search) != "" {
		q = q.Where("articles.search_tsv @@ plainto_tsquery('english', ?)", f.Search)
	}

	if len(f.TopicSlugs) > 0 {
		sub := s.db.WithContext(ctx).
			Table("article_topics at").
			Select("at.article_id").
			Joins("JOIN topics t ON t.id = at.topic_id").
			Where("t.slug IN ?", f.TopicSlugs)
		q = q.Where("articles.id IN (?)", sub)
	}

	return q
}

func (s *articleStorage) applyOrder(q *gorm.DB, sort contracts.ArticleSort) *gorm.DB {
	switch sort {
	case contracts.ArticleSortRecent:
		return q.Order("articles.published_at DESC NULLS LAST").Order("articles.id")
	case contracts.ArticleSortTitle:
		return q.Order("articles.title ASC").Order("articles.id")
	default: // featured-first, then most recent
		return q.Order("articles.featured DESC").Order("articles.published_at DESC NULLS LAST").Order("articles.id")
	}
}

// attachTopics batch-loads the topics for a page of articles (avoids N+1).
func (s *articleStorage) attachTopics(ctx context.Context, articles []models.Article, ids []string) error {
	if len(ids) == 0 {
		return nil
	}

	rows := []struct {
		ArticleID   string
		ID          string
		Slug        string
		Name        string
		Description string
		SortOrder   int
	}{}
	if err := s.db.WithContext(ctx).
		Table("article_topics at").
		Select("at.article_id, t.id, t.slug, t.name, t.description, t.sort_order").
		Joins("JOIN topics t ON t.id = at.topic_id").
		Where("at.article_id IN ?", ids).
		Order("t.sort_order, t.name").
		Scan(&rows).Error; err != nil {
		return errorx.NewInternal("load article topics", err)
	}

	byArticle := make(map[string][]models.Topic, len(ids))
	for _, r := range rows {
		byArticle[r.ArticleID] = append(byArticle[r.ArticleID], models.Topic{
			ID:          r.ID,
			Slug:        r.Slug,
			Name:        r.Name,
			Description: r.Description,
			SortOrder:   r.SortOrder,
		})
	}

	for i := range articles {
		articles[i].Topics = byArticle[articles[i].ID]
	}

	return nil
}

func (s *articleStorage) GetPublishedArticleBySlug(ctx context.Context, slug string) (*models.Article, error) {
	var row dao.Article
	err := s.db.WithContext(ctx).
		Where("slug = ? AND status = ?", slug, string(models.ArticleStatusPublished)).
		First(&row).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errorx.NewNotFound("article %q not found", slug)
	}

	if err != nil {
		return nil, errorx.NewInternal("get article", err)
	}

	article := dao.ToArticleModel(row)

	if row.CurrentVersionID != nil {
		var v dao.ArticleVersion
		if err := s.db.WithContext(ctx).First(&v, "id = ?", *row.CurrentVersionID).Error; err != nil {
			return nil, errorx.NewInternal("get article version", err)
		}

		version := dao.ToArticleVersionModel(v)
		var assets []dao.ArticleAsset
		if err := s.db.WithContext(ctx).Where("version_id = ?", v.ID).Order("path").Find(&assets).Error; err != nil {
			return nil, errorx.NewInternal("get article assets", err)
		}

		version.Assets = make([]models.ArticleAsset, len(assets))
		for i, a := range assets {
			version.Assets[i] = dao.ToArticleAssetModel(a)
		}

		article.CurrentVersion = &version
	}

	topics, err := s.topicsForArticle(ctx, article.ID)
	if err != nil {
		return nil, err
	}

	article.Topics = topics
	authors, err := s.authorsForArticle(ctx, article.ID)
	if err != nil {
		return nil, err
	}

	article.Authors = authors
	return &article, nil
}

func (s *articleStorage) topicsForArticle(ctx context.Context, articleID string) ([]models.Topic, error) {
	var rows []dao.Topic
	if err := s.db.WithContext(ctx).
		Table("topics t").
		Select("t.*").
		Joins("JOIN article_topics at ON at.topic_id = t.id").
		Where("at.article_id = ?", articleID).
		Order("t.sort_order, t.name").
		Scan(&rows).Error; err != nil {
		return nil, errorx.NewInternal("load topics", err)
	}

	out := make([]models.Topic, len(rows))
	for i, r := range rows {
		out[i] = dao.ToTopicModel(r)
	}

	return out, nil
}

func (s *articleStorage) authorsForArticle(ctx context.Context, articleID string) ([]models.Author, error) {
	var rows []dao.Author
	if err := s.db.WithContext(ctx).
		Table("authors a").
		Select("a.*").
		Joins("JOIN article_authors aa ON aa.author_id = a.id").
		Where("aa.article_id = ?", articleID).
		Order("aa.sort_order, a.name").
		Scan(&rows).Error; err != nil {
		return nil, errorx.NewInternal("load authors", err)
	}

	out := make([]models.Author, len(rows))
	for i, r := range rows {
		out[i] = dao.ToAuthorModel(r)
	}

	return out, nil
}

func (s *articleStorage) ListTopics(ctx context.Context) ([]contracts.TopicWithCount, error) {
	rows := []struct {
		ID           string
		Slug         string
		Name         string
		Description  string
		SortOrder    int
		ArticleCount int64
	}{}
	if err := s.db.WithContext(ctx).
		Table("topics t").
		Select("t.id, t.slug, t.name, t.description, t.sort_order, COUNT(a.id) AS article_count").
		Joins("LEFT JOIN article_topics at ON at.topic_id = t.id").
		Joins("LEFT JOIN articles a ON a.id = at.article_id AND a.status = 'published'").
		Group("t.id").
		Order("t.sort_order, t.name").
		Scan(&rows).Error; err != nil {
		return nil, errorx.NewInternal("list topics", err)
	}

	out := make([]contracts.TopicWithCount, len(rows))
	for i, r := range rows {
		out[i] = contracts.TopicWithCount{
			Topic: models.Topic{
				ID:          r.ID,
				Slug:        r.Slug,
				Name:        r.Name,
				Description: r.Description,
				SortOrder:   r.SortOrder,
			},
			ArticleCount: r.ArticleCount,
		}
	}

	return out, nil
}

func (s *articleStorage) NextVersion(ctx context.Context, slug string) (int, error) {
	var n int
	err := s.db.WithContext(ctx).Raw(
		`SELECT COALESCE(MAX(av.version), 0) + 1
		   FROM article_versions av
		   JOIN articles a ON a.id = av.article_id
		  WHERE a.slug = ?`, slug).Scan(&n).Error
	if err != nil {
		return 0, errorx.NewInternal("compute next version", err)
	}

	if n == 0 {
		n = 1
	}

	return n, nil
}

func (s *articleStorage) FindCommittedVersionByChecksum(ctx context.Context, slug, checksum string) (*models.ArticleVersion, error) {
	if checksum == "" {
		return nil, nil
	}

	var v dao.ArticleVersion
	err := s.db.WithContext(ctx).
		Table("article_versions av").
		Select("av.*").
		Joins("JOIN articles a ON a.id = av.article_id").
		Where("a.slug = ? AND av.checksum = ? AND av.status = ? AND av.committed_at IS NOT NULL",
			slug, checksum, string(models.ArticleStatusPublished)).
		First(&v).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, errorx.NewInternal("find version by checksum", err)
	}

	m := dao.ToArticleVersionModel(v)
	return &m, nil
}

func (s *articleStorage) BeginIngest(
	ctx context.Context,
	article *models.Article,
	version *models.ArticleVersion,
	topicSlugs, authorSlugs []string,
	job contracts.IngestJobInput,
) (string, string, error) {
	var versionID, jobID string

	err := database.RunInTransactionWithRetry(s.db, ctx, func(tx *gorm.DB) error {
		// 1. Upsert the article by slug. Editorial metadata is updated. The
		// publication pointer (current_version_id/status/published_at) is only
		// flipped at commit.
		row := &dao.Article{
			ID:             uuid.NewString(),
			Slug:           article.Slug,
			Type:           string(article.Type),
			Title:          article.Title,
			ShortDesc:      article.ShortDesc,
			LongDesc:       article.LongDesc,
			Status:         string(models.ArticleStatusDraft),
			Featured:       article.Featured,
			SortOrder:      article.SortOrder,
			CoverImageURL:  article.CoverImageURL,
			CoverVideoURL:  article.CoverVideoURL,
			ReadingMinutes: article.ReadingMinutes,
			SEOTitle:       article.SEOTitle,
			SEODescription: article.SEODescription,
			CanonicalURL:   article.CanonicalURL,
			SourceDir:      article.SourceDir,
		}
		if err := tx.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "slug"}},
			DoUpdates: clause.AssignmentColumns([]string{
				"type", "title", "shortdesc", "longdesc", "featured", "sort_order",
				"cover_image_url", "cover_video_url", "reading_minutes",
				"seo_title", "seo_description", "canonical_url", "source_dir", "updated_at",
			}),
		}).Create(row).Error; err != nil {
			return err
		}

		// On the ON CONFLICT (slug) DO UPDATE path GORM does not return the
		// existing row's id (the PK was client-supplied), so read it back by
		// slug to get the canonical id for both insert and update cases.
		var articleID string
		if err := tx.Model(&dao.Article{}).Where("slug = ?", article.Slug).
			Select("id").Scan(&articleID).Error; err != nil {
			return err
		}

		if articleID == "" {
			return fmt.Errorf("article id not found after upsert for slug %q", article.Slug)
		}

		// 2. Upsert + link topics (replace the article's topic set).
		if err := s.replaceTopics(tx, articleID, topicSlugs); err != nil {
			return err
		}

		// 3. Upsert + link authors (replace the article's author set).
		if err := s.replaceAuthors(tx, articleID, authorSlugs); err != nil {
			return err
		}

		// 4. Insert the draft version carrying the planned manifest.
		ver := &dao.ArticleVersion{
			ID:          uuid.NewString(),
			ArticleID:   articleID,
			Version:     version.Version,
			Status:      string(models.ArticleStatusDraft),
			R2Prefix:    version.R2Prefix,
			Entrypoint:  version.Entrypoint,
			Manifest:    dao.NewJSONColumn(version.Manifest),
			BuildCommit: version.BuildCommit,
			BuildRef:    version.BuildRef,
			Checksum:    version.Checksum,
			ByteSize:    version.ByteSize,
			FileCount:   version.FileCount,
		}
		if err := tx.Create(ver).Error; err != nil {
			return err
		}

		versionID = ver.ID

		// 5. Open the ingest audit job.
		jr := &dao.IngestJob{
			ID:               uuid.NewString(),
			ArticleSlug:      article.Slug,
			ArticleType:      string(article.Type),
			Version:          version.Version,
			Status:           "begun",
			SourceCommit:     job.SourceCommit,
			SourceRef:        job.SourceRef,
			ManifestChecksum: job.ManifestChecksum,
			RequestedBy:      job.RequestedBy,
		}
		if err := tx.Create(jr).Error; err != nil {
			return err
		}

		jobID = jr.ID
		return nil
	})
	if err != nil {
		return "", "", mapWriteError(err, "article ingest")
	}

	return versionID, jobID, nil
}

func (s *articleStorage) replaceTopics(tx *gorm.DB, articleID string, slugs []string) error {
	if err := tx.Where("article_id = ?", articleID).Delete(&dao.ArticleTopic{}).Error; err != nil {
		return err
	}

	if len(slugs) == 0 {
		return nil
	}

	topicRows := make([]dao.Topic, 0, len(slugs))
	for _, slug := range slugs {
		topicRows = append(topicRows, dao.Topic{ID: uuid.NewString(), Slug: slug, Name: humanizeSlug(slug)})
	}

	if err := tx.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "slug"}},
		DoNothing: true,
	}).Create(&topicRows).Error; err != nil {
		return err
	}

	var topics []dao.Topic
	if err := tx.Where("slug IN ?", slugs).Find(&topics).Error; err != nil {
		return err
	}

	links := make([]dao.ArticleTopic, 0, len(topics))
	for _, t := range topics {
		links = append(links, dao.ArticleTopic{ArticleID: articleID, TopicID: t.ID})
	}

	return tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&links).Error
}

func (s *articleStorage) replaceAuthors(tx *gorm.DB, articleID string, slugs []string) error {
	if err := tx.Where("article_id = ?", articleID).Delete(&dao.ArticleAuthor{}).Error; err != nil {
		return err
	}

	if len(slugs) == 0 {
		return nil
	}

	authorRows := make([]dao.Author, 0, len(slugs))
	for _, slug := range slugs {
		authorRows = append(authorRows, dao.Author{ID: uuid.NewString(), Slug: slug, Name: humanizeSlug(slug)})
	}

	if err := tx.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "slug"}},
		DoNothing: true,
	}).Create(&authorRows).Error; err != nil {
		return err
	}

	var authors []dao.Author
	if err := tx.Where("slug IN ?", slugs).Find(&authors).Error; err != nil {
		return err
	}

	order := make(map[string]int, len(slugs))
	for i, slug := range slugs {
		order[slug] = i
	}

	links := make([]dao.ArticleAuthor, 0, len(authors))
	for _, a := range authors {
		links = append(links, dao.ArticleAuthor{ArticleID: articleID, AuthorID: a.ID, SortOrder: order[a.Slug]})
	}

	return tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&links).Error
}

func (s *articleStorage) GetDraftVersion(ctx context.Context, versionID string) (*models.ArticleVersion, *models.Article, error) {
	var v dao.ArticleVersion
	err := s.db.WithContext(ctx).First(&v, "id = ?", versionID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil, errorx.NewNotFound("ingest version %q not found", versionID)
	}

	if err != nil {
		return nil, nil, errorx.NewInternal("get draft version", err)
	}

	var a dao.Article
	if err := s.db.WithContext(ctx).First(&a, "id = ?", v.ArticleID).Error; err != nil {
		return nil, nil, errorx.NewInternal("get version article", err)
	}

	vm := dao.ToArticleVersionModel(v)
	am := dao.ToArticleModel(a)
	return &vm, &am, nil
}

func (s *articleStorage) CommitIngest(
	ctx context.Context,
	versionID, jobID string,
	assets []models.ArticleAsset,
	manifest models.Manifest,
) (*models.Article, error) {
	var articleID string

	err := database.RunInTransactionWithRetry(s.db, ctx, func(tx *gorm.DB) error {
		var v dao.ArticleVersion
		if err := tx.First(&v, "id = ?", versionID).Error; err != nil {
			return err
		}

		articleID = v.ArticleID
		if len(assets) > 0 {
			rows := make([]dao.ArticleAsset, len(assets))
			for i, a := range assets {
				rows[i] = dao.ArticleAsset{
					ID:           uuid.NewString(),
					VersionID:    versionID,
					Path:         a.Path,
					R2Key:        a.R2Key,
					ContentType:  a.ContentType,
					ByteSize:     a.ByteSize,
					SHA256:       a.SHA256,
					Kind:         string(a.Kind),
					IsEntrypoint: a.IsEntrypoint,
				}
			}

			if err := tx.Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "version_id"}, {Name: "path"}},
				UpdateAll: true,
			}).Create(&rows).Error; err != nil {
				return err
			}
		}

		manifestJSON, err := json.Marshal(manifest)
		if err != nil {
			return err
		}

		if err := tx.Model(&dao.ArticleVersion{}).Where("id = ?", versionID).Updates(map[string]any{
			"status":       string(models.ArticleStatusPublished),
			"committed_at": time.Now().UTC(),
			"manifest":     string(manifestJSON),
			"byte_size":    v.ByteSize,
			"file_count":   len(assets),
		}).Error; err != nil {
			return err
		}

		// Flip the live pointer and publish the article (keep original published_at on re-publish).
		if err := tx.Model(&dao.Article{}).Where("id = ?", articleID).Updates(map[string]any{
			"current_version_id": versionID,
			"status":             string(models.ArticleStatusPublished),
			"published_at":       gorm.Expr("COALESCE(published_at, now())"),
		}).Error; err != nil {
			return err
		}

		if jobID != "" {
			if err := tx.Model(&dao.IngestJob{}).Where("id = ?", jobID).Updates(map[string]any{
				"status":       "committed",
				"committed_at": time.Now().UTC(),
			}).Error; err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		return nil, mapWriteError(err, "article commit")
	}

	var a dao.Article
	if err := s.db.WithContext(ctx).First(&a, "id = ?", articleID).Error; err != nil {
		return nil, errorx.NewInternal("reload committed article", err)
	}

	m := dao.ToArticleModel(a)
	m.Topics, _ = s.topicsForArticle(ctx, articleID)
	m.Authors, _ = s.authorsForArticle(ctx, articleID)
	return &m, nil
}

func (s *articleStorage) FailIngest(ctx context.Context, jobID, reason string) error {
	if jobID == "" {
		return nil
	}

	if len(reason) > 1000 {
		reason = reason[:1000]
	}

	return s.db.WithContext(ctx).Model(&dao.IngestJob{}).Where("id = ?", jobID).Updates(map[string]any{
		"status": "failed",
		"error":  reason,
	}).Error
}

func (s *articleStorage) DeleteArticle(ctx context.Context, slug string) ([]string, error) {
	var prefixes []string
	if err := s.db.WithContext(ctx).Raw(
		`SELECT av.r2_prefix
		   FROM article_versions av
		   JOIN articles a ON a.id = av.article_id
		  WHERE a.slug = ?`, slug).Scan(&prefixes).Error; err != nil {
		return nil, errorx.NewInternal("collect article prefixes", err)
	}

	res := s.db.WithContext(ctx).Where("slug = ?", slug).Delete(&dao.Article{})
	if res.Error != nil {
		return nil, mapWriteError(res.Error, "delete article")
	}

	if res.RowsAffected == 0 {
		return nil, errorx.NewNotFound("article %q not found", slug)
	}

	return prefixes, nil
}

func mapWriteError(err error, entity string) error {
	if err == nil {
		return nil
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return errorx.NewNotFound("%s not found", entity)
	}

	var pg *pgconn.PgError
	if errors.As(err, &pg) {
		switch pg.Code {
		case "23505": // unique_violation
			return errorx.NewConflict("%s already exists", entity)
		case "23503", "23514": // foreign_key_violation, check_violation
			return errorx.NewConstraintViolation("%s: %s", entity, pg.Message)
		}
	}

	return errorx.NewInternal(fmt.Sprintf("db error on %s", entity), err)
}

func humanizeSlug(slug string) string {
	parts := strings.FieldsFunc(slug, func(r rune) bool { return r == '-' || r == '_' })
	for i, p := range parts {
		if p == "" {
			continue
		}

		parts[i] = strings.ToUpper(p[:1]) + p[1:]
	}

	return strings.Join(parts, " ")
}
