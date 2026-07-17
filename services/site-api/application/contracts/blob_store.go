package contracts

import (
	"context"
	"time"
)

// BlobStore is the object-storage port used by the ingest use case. It is a
// narrow view over the R2/S3 client so the application layer never imports the
// storage SDK directly.
type BlobStore interface {
	ObjectExists(ctx context.Context, key string) (bool, error)
	// PresignPut returns a time-limited URL that the caller (CI) can PUT to
	// directly, so R2 write credentials never leave the API.
	PresignPut(ctx context.Context, key, contentType string, expiry time.Duration) (string, error)
	PublicURL(key string) string
	DeletePrefix(ctx context.Context, prefix string) error
}
