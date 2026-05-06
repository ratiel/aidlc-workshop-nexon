package model

import (
	"encoding/json"
	"net/http"
)

type AppError struct {
	Code    string       `json:"code"`
	Message string       `json:"message"`
	Status  int          `json:"-"`
	Details []FieldError `json:"details,omitempty"`
}

type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func (e *AppError) Error() string {
	return e.Message
}

func (e *AppError) WriteJSON(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(e.Status)
	json.NewEncoder(w).Encode(map[string]*AppError{"error": e})
}

// Error constructors
func ErrInvalidCredentials() *AppError {
	return &AppError{Code: "INVALID_CREDENTIALS", Message: "Invalid credentials", Status: http.StatusUnauthorized}
}

func ErrTokenExpired() *AppError {
	return &AppError{Code: "TOKEN_EXPIRED", Message: "Token expired", Status: http.StatusUnauthorized}
}

func ErrTokenInvalid() *AppError {
	return &AppError{Code: "TOKEN_INVALID", Message: "Invalid token", Status: http.StatusUnauthorized}
}

func ErrValidation(details []FieldError) *AppError {
	return &AppError{Code: "VALIDATION_ERROR", Message: "Validation failed", Status: http.StatusBadRequest, Details: details}
}

func ErrSessionCompleting() *AppError {
	return &AppError{Code: "SESSION_COMPLETING", Message: "Table session is being completed, orders not accepted", Status: http.StatusBadRequest}
}

func ErrNoActiveSession() *AppError {
	return &AppError{Code: "NO_ACTIVE_SESSION", Message: "No active session for this table", Status: http.StatusBadRequest}
}

func ErrInvalidStatusTransition() *AppError {
	return &AppError{Code: "INVALID_STATUS_TRANSITION", Message: "Invalid status transition", Status: http.StatusBadRequest}
}

func ErrNotFound(resource string) *AppError {
	return &AppError{Code: resource + "_NOT_FOUND", Message: resource + " not found", Status: http.StatusNotFound}
}

func ErrTableNumberExists() *AppError {
	return &AppError{Code: "TABLE_NUMBER_EXISTS", Message: "Table number already exists", Status: http.StatusBadRequest}
}

func ErrRateLimitExceeded() *AppError {
	return &AppError{Code: "RATE_LIMIT_EXCEEDED", Message: "Too many requests", Status: http.StatusTooManyRequests}
}

func ErrAccountLocked() *AppError {
	return &AppError{Code: "ACCOUNT_LOCKED", Message: "Account temporarily locked", Status: http.StatusTooManyRequests}
}

func ErrInternal() *AppError {
	return &AppError{Code: "INTERNAL_ERROR", Message: "Internal server error", Status: http.StatusInternalServerError}
}
