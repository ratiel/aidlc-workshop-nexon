package service

import (
	"sync"
	"time"

	"github.com/table-order/backend/internal/auth"
	"github.com/table-order/backend/internal/model"
	"github.com/table-order/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	adminRepo  *repository.AdminRepository
	tableRepo  *repository.TableRepository
	tokenMgr   *auth.TokenManager
	mu         sync.Mutex
	loginFails map[string]*loginAttempt
}

type loginAttempt struct {
	count    int
	lockedAt time.Time
}

func NewAuthService(adminRepo *repository.AdminRepository, tableRepo *repository.TableRepository, tokenMgr *auth.TokenManager) *AuthService {
	return &AuthService{
		adminRepo:  adminRepo,
		tableRepo:  tableRepo,
		tokenMgr:   tokenMgr,
		loginFails: make(map[string]*loginAttempt),
	}
}

func (s *AuthService) AuthenticateTable(tableNumber int, password string) (string, int, error) {
	table, err := s.tableRepo.GetByNumber(tableNumber)
	if err != nil {
		return "", 0, err
	}
	if table == nil {
		return "", 0, model.ErrInvalidCredentials()
	}
	if err := bcrypt.CompareHashAndPassword([]byte(table.PasswordHash), []byte(password)); err != nil {
		return "", 0, model.ErrInvalidCredentials()
	}
	token, err := s.tokenMgr.GenerateTableToken(table.ID, table.TableNumber)
	if err != nil {
		return "", 0, err
	}
	return token, table.ID, nil
}

func (s *AuthService) AuthenticateAdmin(username, password, clientIP string) (string, error) {
	s.mu.Lock()
	attempt := s.loginFails[clientIP]
	if attempt != nil && attempt.count >= 5 && time.Since(attempt.lockedAt) < 5*time.Minute {
		s.mu.Unlock()
		return "", model.ErrAccountLocked()
	}
	s.mu.Unlock()

	admin, err := s.adminRepo.GetByUsername(username)
	if err != nil {
		return "", err
	}
	if admin == nil {
		s.recordFailure(clientIP)
		return "", model.ErrInvalidCredentials()
	}
	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(password)); err != nil {
		s.recordFailure(clientIP)
		return "", model.ErrInvalidCredentials()
	}

	s.mu.Lock()
	delete(s.loginFails, clientIP)
	s.mu.Unlock()

	token, err := s.tokenMgr.GenerateAdminToken(admin.ID, admin.Username)
	if err != nil {
		return "", err
	}
	return token, nil
}

func (s *AuthService) recordFailure(ip string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	attempt := s.loginFails[ip]
	if attempt == nil {
		attempt = &loginAttempt{}
		s.loginFails[ip] = attempt
	}
	attempt.count++
	if attempt.count >= 5 {
		attempt.lockedAt = time.Now()
	}
}
