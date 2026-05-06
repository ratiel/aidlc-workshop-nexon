package validator

import "github.com/table-order/backend/internal/model"

type Validator struct {
	errors []model.FieldError
}

func New() *Validator {
	return &Validator{}
}

func (v *Validator) RequireString(field, value string, maxLen int) {
	if value == "" {
		v.errors = append(v.errors, model.FieldError{Field: field, Message: "is required"})
	} else if len(value) > maxLen {
		v.errors = append(v.errors, model.FieldError{Field: field, Message: "exceeds maximum length"})
	}
}

func (v *Validator) RequirePositiveInt(field string, value int) {
	if value <= 0 {
		v.errors = append(v.errors, model.FieldError{Field: field, Message: "must be positive"})
	}
}

func (v *Validator) RequireMinLen(field, value string, minLen int) {
	if len(value) < minLen {
		v.errors = append(v.errors, model.FieldError{Field: field, Message: "too short"})
	}
}

func (v *Validator) HasErrors() bool {
	return len(v.errors) > 0
}

func (v *Validator) ToAppError() *model.AppError {
	return model.ErrValidation(v.errors)
}
