package error

import (
	"errors"
	"fmt"
)

// PublicError is implemented by every error in this package. It carries a
// machine-readable Code and a user-safe PublicMessage, which is everything the
// presentation layer needs to build the HTTP error response. Errors that do
// not implement it are treated as opaque internal errors (500).
type PublicError interface {
	error
	Code() Code
	PublicMessage() string
}

// AppError is the generic application error. Use it (via the constructors
// below) for error kinds that need no bespoke payload; kinds that carry
// structured data have their own types in errors.go.
type AppError struct {
	ErrCode Code
	Msg     string            // user-safe message, surfaced in the response
	Detail  string            // internal-only context, logged but never sent
	Err     error             // wrapped cause, if any
	Fields  map[string]string // per-field validation errors
}

func (e *AppError) Error() string {
	msg := fmt.Sprintf("[%s] %s", e.ErrCode, e.Msg)
	if e.Detail != "" {
		msg += ": " + e.Detail
	}

	if e.Err != nil {
		msg += ": " + e.Err.Error()
	}

	return msg
}

func (e *AppError) Unwrap() error         { return e.Err }
func (e *AppError) Code() Code            { return e.ErrCode }
func (e *AppError) PublicMessage() string { return e.Msg }

func NewBadRequest(format string, a ...any) *AppError {
	return &AppError{ErrCode: CodeBadRequest, Msg: fmt.Sprintf(format, a...)}
}

func NewValidation(msg string, fields map[string]string) *AppError {
	return &AppError{ErrCode: CodeValidation, Msg: msg, Fields: fields}
}

func NewConstraintViolation(format string, a ...any) *AppError {
	return &AppError{ErrCode: CodeConstraintViolation, Msg: fmt.Sprintf(format, a...)}
}

func NewNotFound(format string, a ...any) *AppError {
	return &AppError{ErrCode: CodeNotFound, Msg: fmt.Sprintf(format, a...)}
}

func NewUnauthorized(format string, a ...any) *AppError {
	return &AppError{ErrCode: CodeUnauthorized, Msg: fmt.Sprintf(format, a...)}
}

func NewConflict(format string, a ...any) *AppError {
	return &AppError{ErrCode: CodeConflict, Msg: fmt.Sprintf(format, a...)}
}

func NewInternal(detail string, err error) *AppError {
	return &AppError{ErrCode: CodeInternal, Msg: "An internal error occurred", Detail: detail, Err: err}
}

func NewExternal(code Code, publicMsg string, err error) *AppError {
	return &AppError{ErrCode: code, Msg: publicMsg, Err: err}
}

func CodeOf(err error) Code {
	var pe PublicError
	if errors.As(err, &pe) {
		return pe.Code()
	}

	return CodeInternal
}

func Is(err error, c Code) bool {
	return CodeOf(err) == c
}

func FieldsOf(err error) map[string]string {
	var ae *AppError
	if errors.As(err, &ae) {
		return ae.Fields
	}

	return nil
}
