package main

import (
	"context"
	"time"

	_ "github.com/computeflux-xyz/agency/services/site-api/docs"
	"github.com/computeflux-xyz/agency/services/site-api/server"
	"github.com/computeflux-xyz/base-go/logger"
)

// @title Agency site API
// @version 1.0
// @description API for reading agency site resources and triggering contact workflow
// @termsOfService http://swagger.io/terms/

// @BasePath /
// @schemes https http

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Admin bearer token for the publish (ingest) endpoints. Format: "Bearer <token>".
func main() {
	mainCtx := context.Background()
	app, err := server.NewServer(mainCtx)
	if err != nil {
		logger.GetLogger().Fatalf("Failed to bootstrap the server: %v", err)
	}

	err = app.RunAndWaitForShutdown(10 * time.Second)
	if err != nil {
		logger.GetLogger().Fatalf("Shutdown error: %v", err)
	}

	logger.GetLogger().Info("Service exited properly")
}
