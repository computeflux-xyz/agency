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
	Contact  Contact                 `mapstructure:"contact"`
	Resend   Resend                  `mapstructure:"resend"`
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

type Contact struct {
	Token string `mapstructure:"token"`
}

type Resend struct {
	Enabled                     bool   `mapstructure:"enabled"`
	APIKey                      string `mapstructure:"api_key"`
	FromEmail                   string `mapstructure:"from_email"`
	AdminEmail                  string `mapstructure:"admin_email"`
	FirstContactTemplateID      string `mapstructure:"first_contact_template_id"`
	FirstContactAdminTemplateID string `mapstructure:"first_contact_admin_template_id"`
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

	// Contact validation
	if c.Contact.Token == "" {
		errors = append(errors, "contact.token is required")
	}

	// Resend validation
	if c.Resend.Enabled {
		if c.Resend.APIKey == "" {
			errors = append(errors, "resend.api_key is required when resend is enabled")
		}

		if c.Resend.FromEmail == "" {
			errors = append(errors, "resend.from_email is required when resend is enabled")
		}

		if c.Resend.AdminEmail == "" {
			errors = append(errors, "resend.admin_email is required when resend is enabled")
		}

		if c.Resend.FirstContactTemplateID == "" {
			errors = append(errors, "resend.first_contact_template_id is required when resend is enabled")
		}

		if c.Resend.FirstContactAdminTemplateID == "" {
			errors = append(errors, "resend.first_contact_admin_template_id is required when resend is enabled")
		}
	}

	if len(errors) > 0 {
		return fmt.Errorf("configuration validation errors: %v", errors)
	}

	return nil
}
