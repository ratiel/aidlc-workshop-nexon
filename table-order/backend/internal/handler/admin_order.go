package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/table-order/backend/internal/model"
	"github.com/table-order/backend/internal/service"
)

type AdminOrderHandler struct {
	orderSvc *service.OrderService
}

func NewAdminOrderHandler(orderSvc *service.OrderService) *AdminOrderHandler {
	return &AdminOrderHandler{orderSvc: orderSvc}
}

func (h *AdminOrderHandler) GetAllOrders(w http.ResponseWriter, r *http.Request) {
	orders, err := h.orderSvc.GetAllOrders()
	if err != nil {
		model.ErrInternal().WriteJSON(w)
		return
	}
	if orders == nil {
		orders = []model.OrderWithItems{}
	}
	writeJSON(w, http.StatusOK, orders)
}

type updateStatusRequest struct {
	Status string `json:"status"`
}

func (h *AdminOrderHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	orderID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil || orderID <= 0 {
		model.ErrValidation([]model.FieldError{{Field: "id", Message: "must be a positive integer"}}).WriteJSON(w)
		return
	}

	var req updateStatusRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&req); err != nil {
		model.ErrValidation([]model.FieldError{{Field: "body", Message: "invalid JSON"}}).WriteJSON(w)
		return
	}

	if req.Status != model.OrderStatusPreparing && req.Status != model.OrderStatusCompleted {
		model.ErrValidation([]model.FieldError{{Field: "status", Message: "must be PREPARING or COMPLETED"}}).WriteJSON(w)
		return
	}

	if err := h.orderSvc.UpdateStatus(orderID, req.Status); err != nil {
		if appErr, ok := err.(*model.AppError); ok {
			appErr.WriteJSON(w)
			return
		}
		model.ErrInternal().WriteJSON(w)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"success": true})
}

func (h *AdminOrderHandler) DeleteOrder(w http.ResponseWriter, r *http.Request) {
	orderID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil || orderID <= 0 {
		model.ErrValidation([]model.FieldError{{Field: "id", Message: "must be a positive integer"}}).WriteJSON(w)
		return
	}

	if err := h.orderSvc.DeleteOrder(orderID); err != nil {
		if appErr, ok := err.(*model.AppError); ok {
			appErr.WriteJSON(w)
			return
		}
		model.ErrInternal().WriteJSON(w)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"success": true})
}
