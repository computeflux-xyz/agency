package server

import (
	"context"
	"fmt"
	"time"

	"github.com/computeflux-xyz/agency/services/site-api/application/usecase/articles"
	"github.com/computeflux-xyz/agency/services/site-api/config"
	"github.com/computeflux-xyz/agency/services/site-api/presentation/handlers"
	"github.com/computeflux-xyz/agency/services/site-api/presentation/middlewares"
	blobadapter "github.com/computeflux-xyz/agency/services/site-api/repository/external/blob_storage"
	"github.com/computeflux-xyz/agency/services/site-api/repository/storage"
	"github.com/computeflux-xyz/base-go/app"
	"github.com/computeflux-xyz/base-go/blob_storage"
	config_helper "github.com/computeflux-xyz/base-go/config"
	"github.com/computeflux-xyz/base-go/database"
	"github.com/computeflux-xyz/base-go/logger"
	"github.com/computeflux-xyz/base-go/server/http_server"
	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	gormLogger "gorm.io/gorm/logger"
)

func NewServer(ctx context.Context) (*app.AppServer, error) {
	log := logger.GetLogger()

	cfg, err := config_helper.New[config.Config](
		config_helper.WithConfigFilePath("config.yaml"),
		config_helper.WithBinding(
			map[string][]string{
				"server.port":               {"CONFIG_SERVER_PORT"},
				"server.host":               {"CONFIG_SERVER_HOST"},
				"database.password":         {"CONFIG_DATABASE_PASSWORD"},
				"database.address":          {"CONFIG_DATABASE_ADDRESS"},
				"storage.secret_access_key": {"CONFIG_STORAGE_SECRET_ACCESS_KEY"},
				"storage.endpoint":          {"CONFIG_STORAGE_ENDPOINT"},
				"storage.public_url":        {"CONFIG_STORAGE_PUBLIC_URL"},
				"ingest.token":              {"CONFIG_INGEST_TOKEN"},
			}),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load the config: %v", err)
	}

	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("failed to validate the config: %v", err)
	}

	db, err := database.NewPostgresDB(cfg.Database)
	if err != nil {
		log.Fatalf("Error creating the PostgreSQL client: %v", err)
	}

	if err := db.WaitForStartup(ctx); err != nil {
		log.Fatalf("Error connecting to PostgreSQL: %v", err)
	}

	gormDB, err := database.NewGORMPostgresFromSQLDB(db.DB, database.GORMOptions{
		PrepareStmt:   true,
		Logger:        log,
		LogLevel:      gormLogger.Error,
		SlowThreshold: 200 * time.Millisecond,
	})
	if err != nil {
		log.Fatalf("Error creating the GORM DB: %v", err)
	}
	dbDependency := database.NewDatabaseDependency(db.DB, "PostgreSQL")

	s3Client, err := blob_storage.NewS3Client(ctx, cfg.Storage.S3Config)
	if err != nil {
		log.Fatalf("Error creating the object storage client: %v", err)
	}

	blobStore := blobadapter.New(s3Client)

	articleStorage := storage.NewArticleStorage(gormDB)

	readUseCase := articles.NewReadUseCase(articleStorage)
	articleHandler := handlers.NewArticleHandler(readUseCase)

	presignTTL := time.Duration(cfg.Ingest.PresignTTLMinutes) * time.Minute
	ingestUseCase := articles.NewIngestUseCase(articleStorage, blobStore, articles.IngestConfig{
		KeyPrefix:  cfg.Storage.KeyPrefix,
		PresignTTL: presignTTL,
	})
	ingestHandler := handlers.NewIngestHandler(ingestUseCase)

	routes := func(r *gin.Engine) {
		r.Use(middlewares.ErrorHandler(log))

		if cfg.Server.Env == "dev" {
			r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
		}

		api := r.Group("/api")
		{
			api.GET("/articles", articleHandler.HandleListArticles)
			api.GET("/articles/:slug", articleHandler.HandleGetArticle)
			api.GET("/topics", articleHandler.HandleListTopics)

			if cfg.Ingest.Enabled {
				admin := api.Group("/admin", middlewares.AdminAuth(cfg.Ingest.Token))
				admin.POST("/articles/ingest/begin", ingestHandler.HandleBegin)
				admin.POST("/articles/ingest/commit", ingestHandler.HandleCommit)
				admin.DELETE("/articles/:slug", ingestHandler.HandleDelete)
				log.Info("Admin ingest API enabled")
			} else {
				log.Info("Admin ingest API disabled")
			}
		}

		log.Info("Routes configured successfully")
	}

	serverBuilder := http_server.
		NewBuilder(ctx).
		WithHost(cfg.Server.Host).
		WithPort(cfg.Server.Port).
		WithRoutes(routes)

	return app.
		NewBuilder(ctx).
		WithExternalDependency(dbDependency).
		WithHttpServer(serverBuilder).
		Build()
}
