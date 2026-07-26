package middlewares

import (
	"crypto/subtle"
	"strings"

	"github.com/gin-gonic/gin"

	errorx "github.com/computeflux-xyz/agency/services/site-api/application/error"
)

// BearerAuth guards a route with a static bearer token, compared in constant
// time. misconfiguredMsg backs the 500 returned when token is empty (a
// deployment error); unauthorizedMsg backs the 401 for a missing/wrong token.
func BearerAuth(token, misconfiguredMsg, unauthorizedMsg string) gin.HandlerFunc {
	tokenBytes := []byte(token)
	return func(c *gin.Context) {
		if token == "" {
			_ = c.Error(errorx.NewInternal(misconfiguredMsg, nil))
			c.Abort()
			return
		}

		supplied := ""
		if h := c.GetHeader("Authorization"); strings.HasPrefix(h, "Bearer ") {
			supplied = strings.TrimPrefix(h, "Bearer ")
		}

		if subtle.ConstantTimeCompare([]byte(supplied), tokenBytes) != 1 {
			_ = c.Error(errorx.NewUnauthorized("%s", unauthorizedMsg))
			c.Abort()
			return
		}

		c.Next()
	}
}

// AdminAuth guards the admin ingest routes.
func AdminAuth(token string) gin.HandlerFunc {
	return BearerAuth(token, "admin auth misconfigured: empty token", "invalid or missing admin token")
}

// ContactAuth guards the contact-submission route.
func ContactAuth(token string) gin.HandlerFunc {
	return BearerAuth(token, "contact auth misconfigured: empty token", "invalid or missing contact token")
}
