package error

import "net/http"

// Code is a machine-readable, user-facing error code. It is the single
// vocabulary that the presentation layer (via the error-handling middleware)
// maps to an HTTP status, and it is the value emitted as the "code" field of
// the JSON error envelope. The string values are part of the API contract.
type Code string

const (
	CodeBadRequest          Code = "bad_request"            // 400 — malformed request (bad JSON, missing param, bad query)
	CodeValidation          Code = "validation_error"       // 400 — semantic validation failure
	CodeConstraintViolation Code = "constraint_violation"   // 400 — domain/DB constraint violated
	CodeUnauthorized        Code = "unauthorized"           // 401 — missing/invalid credentials
	CodeNotFound            Code = "not_found"              // 404
	CodeConflict            Code = "conflict"               // 409 — duplicate / already exists
	CodeExternalService     Code = "external_service_error" // 502 — BlobStorage / generic downstream failure
	CodeInternal            Code = "internal_server_error"  // 500 — default for unclassified errors
)

func HTTPStatus(c Code) int {
	switch c {
	case CodeBadRequest, CodeValidation, CodeConstraintViolation:
		return http.StatusBadRequest
	case CodeUnauthorized:
		return http.StatusUnauthorized
	case CodeNotFound:
		return http.StatusNotFound
	case CodeExternalService:
		return http.StatusBadGateway
	default:
		return http.StatusInternalServerError
	}
}
