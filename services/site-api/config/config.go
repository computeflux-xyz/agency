package config

import (
	"fmt"

	"github.com/computeflux-xyz/base-go/blob_storage"
	"github.com/computeflux-xyz/base-go/database"
)

type Config struct {
	Server   Server                  `mapstructure:"server"`
	Database database.DatabaseConfig `mapstructure:"database"`
	Storage  Storage                 `mapstructure:"storage"`
	Ingest   Ingest                  `mapstructure:"ingest"`
}

type Server struct {
	Port int    `mapstructure:"port"`
	Host string `mapstructure:"host"`
	Env  string `mapstructure:"env"`
}

type Storage struct {
	blob_storage.S3Config `mapstructure:",squash"`
	KeyPrefix             string `mapstructure:"key_prefix"` // prefix prepended to all keys (e.g. "agency" for shared buckets)
}

type Ingest struct {
	Enabled           bool   `mapstructure:"enabled"`
	Token             string `mapstructure:"token"`               // bearer token for /api/admin routes (env CONFIG_INGEST_TOKEN)
	PresignTTLMinutes int    `mapstructure:"presign_ttl_minutes"` // lifetime of presigned PUT URLs
}

func (c *Config) Validate() error {
	var errors []string

	// Server validation
	if c.Server.Port <= 0 {
		errors = append(errors, "server.port must be greater than 0")
	}

	if c.Server.Host == "" {
		errors = append(errors, "server.host is required")
	}

	if c.Server.Env == "" || (c.Server.Env != "dev" && c.Server.Env != "prod") {
		errors = append(errors, "server.env must be either 'dev' or 'prod'")
	}

	// Database validation
	if err := c.Database.Validate(); err != nil {
		errors = append(errors, err.Error())
	}

	// Storage validation
	if c.Storage.Endpoint == "" {
		errors = append(errors, "storage.endpoint is required")
	}

	if c.Storage.AccessKeyID == "" {
		errors = append(errors, "storage.access_key_id is required")
	}

	if c.Storage.SecretAccessKey == "" {
		errors = append(errors, "storage.secret_access_key is required")
	}

	if c.Storage.Bucket == "" {
		errors = append(errors, "storage.bucket is required")
	}

	// Ingest validation
	if c.Ingest.Enabled && c.Ingest.Token == "" {
		errors = append(errors, "ingest.token is required when ingest is enabled")
	}

	if len(errors) > 0 {
		return fmt.Errorf("configuration validation errors: %v", errors)
	}

	return nil
}
