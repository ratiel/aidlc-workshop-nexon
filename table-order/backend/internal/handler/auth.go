package handler

import (
	"encoding/json"
	"net/http"

	"github.com/table-order/backend/internal/middleware"
	"github.com/table-order/backend/internal/model"
	"github.com/table-order/backend/internal/service"
	"github.com/table-order/backend/internal/validator"
)

type AuthHandler struct {
	authSvc *service.AuthService
}

func NewAuthHandler(authSvc *service.AuthService) *AuthHandler {
	return &AuthHandler{authSvc: authSvc}
}

type tableAuthRequest struct {
	TableNumber int    `json:"table_number"`
	Password    string `json:"password"`
}

type adminLoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (h *AuthHandler) TableAuth(w http.ResponseWriter, r *http.Request) {
	var req tableAuthRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&req); err != nil {
		model.ErrValidation([]model.FieldError{{Field: "body", Message: "invalid JSON"}}).WriteJSON(w)
		return
	}

	v := validator.New()
	v.RequirePositiveInt("table_number", req.TableNumber)
	v.RequireMinLen("password", req.Password, 4)
	if v.HasErrors() {
		v.ToAppError().WriteJSON(w)
		return
	}

	token, tableID, err := h.authSvc.AuthenticateTable(req.TableNumber, req.Password)
	if err != nil {
		if appErr, ok := err.(*model.AppError); ok {
			appErr.WriteJSON(w)
			return
		}
		model.ErrInternal().WriteJSON(w)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"token": token, "table_id": tableID})
}

func (h *AuthHandler) AdminLogin(w http.ResponseWriter, r *http.Request) {
	var req adminLoginRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&req); err != nil {
		model.ErrValidation([]model.FieldError{{Field: "body", Message: "invalid JSON"}}).WriteJSON(w)
		return
	}

	v := validator.New()
	v.RequireString("username", req.Username, 50)
	v.RequireMinLen("password", req.Password, 4)
	if v.HasErrors() {
		v.ToAppError().WriteJSON(w)
		return
	}

	clientIP := middleware.GetClientIP(r)
	token, err := h.authSvc.AuthenticateAdmin(req.Username, req.Password, clientIP)
	if err != nil {
		if appErr, ok := err.(*model.AppError); ok {
			appErr.WriteJSON(w)
			return
		}
		model.ErrInternal().WriteJSON(w)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"token": token})
}
