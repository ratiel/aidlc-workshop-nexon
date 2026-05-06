package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/table-order/backend/internal/model"
	"github.com/table-order/backend/internal/service"
	"github.com/table-order/backend/internal/validator"
)

type TableHandler struct {
	tableSvc *service.TableService
}

func NewTableHandler(tableSvc *service.TableService) *TableHandler {
	return &TableHandler{tableSvc: tableSvc}
}

type createTableRequest struct {
	TableNumber int    `json:"table_number"`
	Password    string `json:"password"`
}

func (h *TableHandler) CreateTable(w http.ResponseWriter, r *http.Request) {
	var req createTableRequest
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

	table, err := h.tableSvc.CreateTable(req.TableNumber, req.Password)
	if err != nil {
		if appErr, ok := err.(*model.AppError); ok {
			appErr.WriteJSON(w)
			return
		}
		model.ErrInternal().WriteJSON(w)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{"id": table.ID, "table_number": table.TableNumber})
}

func (h *TableHandler) CompleteSession(w http.ResponseWriter, r *http.Request) {
	tableID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil || tableID <= 0 {
		model.ErrValidation([]model.FieldError{{Field: "id", Message: "must be a positive integer"}}).WriteJSON(w)
		return
	}

	if err := h.tableSvc.CompleteSession(tableID); err != nil {
		if appErr, ok := err.(*model.AppError); ok {
			appErr.WriteJSON(w)
			return
		}
		model.ErrInternal().WriteJSON(w)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"success": true})
}

func (h *TableHandler) GetHistory(w http.ResponseWriter, r *http.Request) {
	tableID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil || tableID <= 0 {
		model.ErrValidation([]model.FieldError{{Field: "id", Message: "must be a positive integer"}}).WriteJSON(w)
		return
	}

	dateFrom := r.URL.Query().Get("date_from")
	dateTo := r.URL.Query().Get("date_to")

	orders, err := h.tableSvc.GetHistory(tableID, dateFrom, dateTo)
	if err != nil {
		if appErr, ok := err.(*model.AppError); ok {
			appErr.WriteJSON(w)
			return
		}
		model.ErrInternal().WriteJSON(w)
		return
	}
	if orders == nil {
		orders = []model.OrderWithItems{}
	}
	writeJSON(w, http.StatusOK, orders)
}
