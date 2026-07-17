package middlewares

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	errorx "github.com/computeflux-xyz/agency/services/site-api/application/error"
	"github.com/computeflux-xyz/agency/services/site-api/presentation/dtos"
)

// ErrorHandler is the single place where errors attached to the Gin context
// (via c.Error) are translated into the JSON error envelope. A handler that
// hits an error attaches it with c.Error(err) and returns. It must not pick an
// HTTP status, build a dtos.ErrorResp, or log the failure itself.
//
// The error's Code (application/error.Code) drives both the HTTP status
// (errorx.HTTPStatus) and the "code" field of the response. Errors that do not
// implement errorx.PublicError are treated as opaque internal errors: the
// client sees a generic 500 and the real cause is only logged.
func ErrorHandler(log *logrus.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) == 0 || c.Writer.Written() {
			return
		}

		err := c.Errors.Last().Err
		code := errorx.CodeInternal
		msg := "An internal error occurred"
		var pe errorx.PublicError
		if errors.As(err, &pe) {
			code = pe.Code()
			msg = pe.PublicMessage()
		}

		status := errorx.HTTPStatus(code)
		entry := log.WithField("path", c.Request.URL.Path).
			WithField("method", c.Request.Method).
			WithField("code", code).
			WithError(err)

		if status >= 500 {
			entry.Error("request failed")
		} else {
			entry.Warn("request failed")
		}

		c.JSON(status, dtos.ErrorResp{
			Code:    string(code),
			Message: msg,
			Fields:  errorx.FieldsOf(err),
		})
	}
}
