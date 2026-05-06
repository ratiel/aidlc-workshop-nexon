package service

import (
	"github.com/table-order/backend/internal/model"
	"github.com/table-order/backend/internal/repository"
)

type MenuService struct {
	menuRepo *repository.MenuRepository
}

func NewMenuService(menuRepo *repository.MenuRepository) *MenuService {
	return &MenuService{menuRepo: menuRepo}
}

func (s *MenuService) GetCategories() ([]model.Category, error) {
	return s.menuRepo.GetCategories()
}

func (s *MenuService) GetMenusByCategory(categoryID int) ([]model.Menu, error) {
	return s.menuRepo.GetMenusByCategory(categoryID)
}
