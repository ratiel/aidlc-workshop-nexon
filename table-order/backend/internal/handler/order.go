package handler

import (
	"encoding/json"
	"net/http"

	"github.com/table-order/backend/internal/middleware"
	"github.com/table-order/backend/internal/model"
	"github.com/table-order/backend/internal/service"
)

type OrderHandler struct {
	orderSvc *service.OrderService
}

func NewOrderHandler(orderSvc *service.OrderService) *OrderHandler {
	return &OrderHandler{orderSvc: orderSvc}
}

func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaims(r.Context())
	if claims == nil {
		model.ErrTokenInvalid().WriteJSON(w)
		return
	}

	var req service.CreateOrderRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&req); err != nil {
		model.ErrValidation([]model.FieldError{{Field: "body", Message: "invalid JSON"}}).WriteJSON(w)
		return
	}

	if errs := service.ValidateCreateOrderRequest(req); len(errs) > 0 {
		model.ErrValidation(errs).WriteJSON(w)
		return
	}

	order, err := h.orderSvc.CreateOrder(claims.TableID, req)
	if err != nil {
		if appErr, ok := err.(*model.AppError); ok {
			appErr.WriteJSON(w)
			return
		}
		model.ErrInternal().WriteJSON(w)
		return
	}

	writeJSON(w, http.StatusCreated, order)
}

func (h *OrderHandler) GetOrders(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaims(r.Context())
	if claims == nil {
		model.ErrTokenInvalid().WriteJSON(w)
		return
	}

	orders, err := h.orderSvc.GetOrdersBySession(claims.TableID)
	if err != nil {
		model.ErrInternal().WriteJSON(w)
		return
	}
	if orders == nil {
		orders = []model.OrderWithItems{}
	}
	writeJSON(w, http.StatusOK, orders)
}
