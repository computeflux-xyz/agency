package middlewares

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	errorx "github.com/computeflux-xyz/agency/services/site-api/application/error"
	"github.com/computeflux-xyz/agency/services/site-api/presentation/dtos"
)

func runWithError(err error) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	log := logrus.New()
	log.SetOutput(io.Discard)

	r := gin.New()
	r.Use(ErrorHandler(log))
	r.GET("/", func(c *gin.Context) {
		if err != nil {
			_ = c.Error(err)
			return
		}

		c.JSON(http.StatusOK, gin.H{"ok": true})
	})

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	r.ServeHTTP(w, req)
	return w
}

func TestErrorHandler(t *testing.T) {
	cases := []struct {
		name        string
		err         error
		wantStatus  int
		wantCode    string
		wantMessage string
		wantFields  map[string]string
	}{
		{
			name:       "not found",
			err:        errorx.NewNotFound("entity %q not found", "d1"),
			wantStatus: http.StatusNotFound, wantCode: "not_found", wantMessage: `entity "d1" not found`,
		},
		{
			name:       "validation with fields",
			err:        errorx.NewValidation("invalid entity", map[string]string{"Name": "Name is required"}),
			wantStatus: http.StatusBadRequest, wantCode: "validation_error", wantMessage: "invalid entity",
			wantFields: map[string]string{"Name": "Name is required"},
		},
		{
			name:       "constraint violation",
			err:        errorx.NewConstraintViolation("entity is required"),
			wantStatus: http.StatusBadRequest, wantCode: "constraint_violation", wantMessage: "entity is required",
		},
		{
			name:       "bad request",
			err:        errorx.NewBadRequest("page must be positive"),
			wantStatus: http.StatusBadRequest, wantCode: "bad_request", wantMessage: "page must be positive",
		},
		{
			name:       "wrapped app error is unwrapped",
			err:        fmt.Errorf("usecase failed: %w", errorx.NewNotFound("entity not found")),
			wantStatus: http.StatusNotFound, wantCode: "not_found", wantMessage: "entity not found",
		},
		{
			name:       "opaque error is generic 500",
			err:        errors.New("kaboom"),
			wantStatus: http.StatusInternalServerError, wantCode: "internal_server_error", wantMessage: "An internal error occurred",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			w := runWithError(tc.err)
			require.Equal(t, tc.wantStatus, w.Code)

			var resp dtos.ErrorResp
			require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
			assert.Equal(t, tc.wantCode, resp.Code)
			assert.Equal(t, tc.wantMessage, resp.Message)
			assert.Equal(t, tc.wantFields, resp.Fields)
		})
	}
}

func TestErrorHandler_NoError_PassesThrough(t *testing.T) {
	w := runWithError(nil)
	assert.Equal(t, http.StatusOK, w.Code)
	assert.JSONEq(t, `{"ok":true}`, w.Body.String())
}
