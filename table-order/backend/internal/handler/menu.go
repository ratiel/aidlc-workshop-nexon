package handler

import (
	"net/http"
	"strconv"

	"github.com/table-order/backend/internal/model"
	"github.com/table-order/backend/internal/service"
)

type MenuHandler struct {
	menuSvc *service.MenuService
}

func NewMenuHandler(menuSvc *service.MenuService) *MenuHandler {
	return &MenuHandler{menuSvc: menuSvc}
}

func (h *MenuHandler) GetCategories(w http.ResponseWriter, r *http.Request) {
	categories, err := h.menuSvc.GetCategories()
	if err != nil {
		model.ErrInternal().WriteJSON(w)
		return
	}
	writeJSON(w, http.StatusOK, categories)
}

func (h *MenuHandler) GetMenusByCategory(w http.ResponseWriter, r *http.Request) {
	categoryID, err := strconv.Atoi(r.PathValue("categoryId"))
	if err != nil || categoryID <= 0 {
		model.ErrValidation([]model.FieldError{{Field: "categoryId", Message: "must be a positive integer"}}).WriteJSON(w)
		return
	}

	menus, err := h.menuSvc.GetMenusByCategory(categoryID)
	if err != nil {
		model.ErrInternal().WriteJSON(w)
		return
	}
	writeJSON(w, http.StatusOK, menus)
}
