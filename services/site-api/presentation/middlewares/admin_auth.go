package middlewares

import (
	"crypto/subtle"
	"strings"

	"github.com/gin-gonic/gin"

	errorx "github.com/computeflux-xyz/agency/services/site-api/application/error"
)

func AdminAuth(token string) gin.HandlerFunc {
	tokenBytes := []byte(token)
	return func(c *gin.Context) {
		if token == "" {
			_ = c.Error(errorx.NewInternal("admin auth misconfigured: empty token", nil))
			c.Abort()
			return
		}

		supplied := ""
		if h := c.GetHeader("Authorization"); strings.HasPrefix(h, "Bearer ") {
			supplied = strings.TrimPrefix(h, "Bearer ")
		}

		if subtle.ConstantTimeCompare([]byte(supplied), tokenBytes) != 1 {
			_ = c.Error(errorx.NewUnauthorized("invalid or missing admin token"))
			c.Abort()
			return
		}

		c.Next()
	}
}
