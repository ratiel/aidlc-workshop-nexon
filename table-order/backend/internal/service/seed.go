package service

import (
	"log/slog"

	"github.com/table-order/backend/internal/config"
	"github.com/table-order/backend/internal/model"
	"github.com/table-order/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type SeedService struct {
	menuRepo  *repository.MenuRepository
	adminRepo *repository.AdminRepository
	cfg       *config.Config
}

func NewSeedService(menuRepo *repository.MenuRepository, adminRepo *repository.AdminRepository, cfg *config.Config) *SeedService {
	return &SeedService{menuRepo: menuRepo, adminRepo: adminRepo, cfg: cfg}
}

func (s *SeedService) Initialize() error {
	if err := s.seedAdmin(); err != nil {
		return err
	}
	return s.seedMenus()
}

func (s *SeedService) seedAdmin() error {
	count, err := s.adminRepo.Count()
	if err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(s.cfg.AdminPassword), 12)
	if err != nil {
		return err
	}

	admin := &model.Admin{Username: s.cfg.AdminUsername, PasswordHash: string(hash)}
	if err := s.adminRepo.Create(admin); err != nil {
		return err
	}
	slog.Info("admin account created", "username", s.cfg.AdminUsername)
	return nil
}

func (s *SeedService) seedMenus() error {
	count, err := s.menuRepo.CountCategories()
	if err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	type menuItem struct {
		name, desc, img string
		price           int
	}
	seeds := map[string][]menuItem{
		"메인": {
			{"불고기 정식", "소고기 불고기와 밥, 반찬 세트", "https://via.placeholder.com/300x200?text=Bulgogi", 12000},
			{"김치찌개", "돼지고기 김치찌개와 밥", "https://via.placeholder.com/300x200?text=Kimchi+Jjigae", 9000},
			{"비빔밥", "야채와 고추장 비빔밥", "https://via.placeholder.com/300x200?text=Bibimbap", 10000},
			{"된장찌개", "두부 된장찌개와 밥", "https://via.placeholder.com/300x200?text=Doenjang", 8500},
		},
		"사이드": {
			{"계란말이", "부드러운 계란말이", "https://via.placeholder.com/300x200?text=Egg+Roll", 5000},
			{"김치전", "바삭한 김치전", "https://via.placeholder.com/300x200?text=Kimchi+Jeon", 6000},
			{"떡볶이", "매콤한 떡볶이", "https://via.placeholder.com/300x200?text=Tteokbokki", 5500},
		},
		"음료": {
			{"콜라", "코카콜라 355ml", "https://via.placeholder.com/300x200?text=Cola", 2000},
			{"사이다", "칠성사이다 355ml", "https://via.placeholder.com/300x200?text=Cider", 2000},
			{"맥주", "생맥주 500ml", "https://via.placeholder.com/300x200?text=Beer", 5000},
			{"소주", "참이슬 360ml", "https://via.placeholder.com/300x200?text=Soju", 5000},
		},
		"디저트": {
			{"아이스크림", "바닐라 아이스크림", "https://via.placeholder.com/300x200?text=Ice+Cream", 3000},
			{"식혜", "전통 식혜", "https://via.placeholder.com/300x200?text=Sikhye", 2500},
		},
	}

	categoryOrder := []string{"메인", "사이드", "음료", "디저트"}
	for i, catName := range categoryOrder {
		catID, err := s.menuRepo.InsertCategory(catName, i+1)
		if err != nil {
			return err
		}
		for j, item := range seeds[catName] {
			if err := s.menuRepo.InsertMenu(int(catID), item.name, item.price, item.desc, item.img, j+1); err != nil {
				return err
			}
		}
	}
	slog.Info("menu seed data created")
	return nil
}
