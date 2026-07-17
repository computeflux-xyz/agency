package blob_storage

import (
	"context"
	"time"

	"github.com/computeflux-xyz/agency/services/site-api/application/contracts"
	basestore "github.com/computeflux-xyz/base-go/blob_storage"
	s3models "github.com/computeflux-xyz/base-go/models"
)

type store struct {
	client *basestore.S3Client
}

func New(client *basestore.S3Client) contracts.BlobStore {
	return &store{client: client}
}

func (s *store) ObjectExists(ctx context.Context, key string) (bool, error) {
	return s.client.ObjectExists(ctx, key)
}

func (s *store) PresignPut(ctx context.Context, key, contentType string, expiry time.Duration) (string, error) {
	return s.client.GetSignedUploadURL(ctx, key, contentType, expiry)
}

func (s *store) PublicURL(key string) string {
	return s.client.GetPublicURL(key)
}

func (s *store) DeletePrefix(ctx context.Context, prefix string) error {
	token := ""
	for {
		out, err := s.client.ListObjectsWithOptions(ctx, s3models.ListOptions{
			Prefix:            prefix,
			MaxKeys:           1000,
			ContinuationToken: token,
		})
		if err != nil {
			return err
		}

		if len(out.Objects) == 0 {
			return nil
		}

		keys := make([]string, len(out.Objects))
		for i, o := range out.Objects {
			keys[i] = o.Key
		}

		if err := s.client.DeleteObjects(ctx, keys); err != nil {
			return err
		}

		if !out.IsTruncated {
			return nil
		}

		token = out.NextContinuationToken
	}
}
