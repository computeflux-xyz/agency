package storage

import (
	"context"
	"database/sql"
	"strings"
	"testing"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"

	"github.com/computeflux-xyz/agency/services/site-api/models"
)

type nopPool struct{}

func (nopPool) PrepareContext(context.Context, string) (*sql.Stmt, error)       { return nil, nil }
func (nopPool) ExecContext(context.Context, string, ...any) (sql.Result, error) { return nil, nil }
func (nopPool) QueryContext(context.Context, string, ...any) (*sql.Rows, error) { return nil, nil }
func (nopPool) QueryRowContext(context.Context, string, ...any) *sql.Row        { return nil }

type sqlCapture struct {
	gormlogger.Interface
	sql string
}

func (c *sqlCapture) Trace(_ context.Context, _ time.Time, fc func() (string, int64), _ error) {
	c.sql, _ = fc()
}

func dryRun(t *testing.T) (*articleStorage, *sqlCapture) {
	t.Helper()

	capture := &sqlCapture{Interface: gormlogger.Discard}
	db, err := gorm.Open(postgres.New(postgres.Config{Conn: nopPool{}}), &gorm.Config{
		DryRun: true,
		Logger: capture,
	})
	if err != nil {
		t.Fatalf("open dry-run gorm: %v", err)
	}

	return &articleStorage{db: db}, capture
}

func TestListTopicsCountsOnlyRequestedTypes(t *testing.T) {
	store, capture := dryRun(t)

	_, _ = store.ListTopics(context.Background(), models.LangFR, []models.ArticleType{models.ArticleTypeBlog})
	if !strings.Contains(capture.sql, "a.type IN ('blog')") {
		t.Fatalf("type predicate missing or malformed:\n%s", capture.sql)
	}

	if !strings.Contains(capture.sql, "a.lang = 'fr'") || !strings.Contains(capture.sql, "a.lang = 'en'") {
		t.Fatalf("locale fallback lost:\n%s", capture.sql)
	}

	_, _ = store.ListTopics(context.Background(), models.LangEN, nil)
	if strings.Contains(capture.sql, "a.type") {
		t.Fatalf("no types requested, yet the query filters on type:\n%s", capture.sql)
	}
}
