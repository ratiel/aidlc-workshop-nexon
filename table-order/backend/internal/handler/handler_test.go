package handler_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/table-order/backend/internal/auth"
	"github.com/table-order/backend/internal/config"
	"github.com/table-order/backend/internal/database"
	"github.com/table-order/backend/internal/handler"
	"github.com/table-order/backend/internal/middleware"
	"github.com/table-order/backend/internal/repository"
	"github.com/table-order/backend/internal/router"
	"github.com/table-order/backend/internal/service"
	"github.com/table-order/backend/internal/sse"
)

func setupTestServer(t *testing.T) (http.Handler, func()) {
	t.Helper()
	os.Setenv("JWT_SECRET", "test-secret-32-chars-long-enough")
	os.Setenv("ADMIN_PASSWORD", "testpass")

	db, err := database.New(":memory:")
	if err != nil {
		t.Fatal(err)
	}

	cfg := &config.Config{
		Port:          "8080",
		DBPath:        ":memory:",
		JWTSecret:     "test-secret-32-chars-long-enough",
		AdminUsername: "admin",
		AdminPassword: "testpass",
		CORSOrigins:   []string{"http://localhost:3000"},
		StoreID:       "test",
	}

	tokenMgr := auth.NewTokenManager(cfg.JWTSecret)
	broker := sse.NewBroker()
	rateLimiter := middleware.NewRateLimiter(1000, 100)

	menuRepo := repository.NewMenuRepository(db.DB)
	orderRepo := repository.NewOrderRepository(db.DB)
	tableRepo := repository.NewTableRepository(db.DB)
	adminRepo := repository.NewAdminRepository(db.DB)

	authSvc := service.NewAuthService(adminRepo, tableRepo, tokenMgr)
	menuSvc := service.NewMenuService(menuRepo)
	orderSvc := service.NewOrderService(orderRepo, menuRepo, tableRepo, broker)
	tableSvc := service.NewTableService(tableRepo, orderRepo, broker)
	seedSvc := service.NewSeedService(menuRepo, adminRepo, cfg)

	if err := seedSvc.Initialize(); err != nil {
		t.Fatal(err)
	}

	authHandler := handler.NewAuthHandler(authSvc)
	menuHandler := handler.NewMenuHandler(menuSvc)
	orderHandler := handler.NewOrderHandler(orderSvc)
	adminOrderHandler := handler.NewAdminOrderHandler(orderSvc)
	tableHandler := handler.NewTableHandler(tableSvc)
	sseHandler := handler.NewSSEHandler(broker, tokenMgr)

	mux := router.New(cfg, tokenMgr, rateLimiter, authHandler, menuHandler, orderHandler, adminOrderHandler, tableHandler, sseHandler)

	cleanup := func() {
		broker.Shutdown()
		db.Close()
	}
	return mux, cleanup
}

func TestAdminLogin(t *testing.T) {
	srv, cleanup := setupTestServer(t)
	defer cleanup()

	body, _ := json.Marshal(map[string]string{"username": "admin", "password": "testpass"})
	req := httptest.NewRequest("POST", "/api/admin/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["token"] == nil {
		t.Fatal("expected token in response")
	}
}

func TestAdminLogin_InvalidPassword(t *testing.T) {
	srv, cleanup := setupTestServer(t)
	defer cleanup()

	body, _ := json.Marshal(map[string]string{"username": "admin", "password": "wrong"})
	req := httptest.NewRequest("POST", "/api/admin/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}
}

func TestCreateTableAndAuth(t *testing.T) {
	srv, cleanup := setupTestServer(t)
	defer cleanup()

	// Login as admin
	adminToken := getAdminToken(t, srv)

	// Create table
	body, _ := json.Marshal(map[string]interface{}{"table_number": 1, "password": "table1pass"})
	req := httptest.NewRequest("POST", "/api/admin/tables", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+adminToken)
	w := httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
	}

	// Auth as table
	body, _ = json.Marshal(map[string]interface{}{"table_number": 1, "password": "table1pass"})
	req = httptest.NewRequest("POST", "/api/table/auth", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
}

func TestGetMenu(t *testing.T) {
	srv, cleanup := setupTestServer(t)
	defer cleanup()

	// Create table and get token
	adminToken := getAdminToken(t, srv)
	tableToken := createTableAndGetToken(t, srv, adminToken, 1, "pass1234")

	req := httptest.NewRequest("GET", "/api/menu", nil)
	req.Header.Set("Authorization", "Bearer "+tableToken)
	w := httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var categories []interface{}
	json.Unmarshal(w.Body.Bytes(), &categories)
	if len(categories) == 0 {
		t.Fatal("expected seeded categories")
	}
}

func getAdminToken(t *testing.T, srv http.Handler) string {
	t.Helper()
	body, _ := json.Marshal(map[string]string{"username": "admin", "password": "testpass"})
	req := httptest.NewRequest("POST", "/api/admin/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	srv.ServeHTTP(w, req)
	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	return resp["token"].(string)
}

func createTableAndGetToken(t *testing.T, srv http.Handler, adminToken string, num int, pass string) string {
	t.Helper()
	body, _ := json.Marshal(map[string]interface{}{"table_number": num, "password": pass})
	req := httptest.NewRequest("POST", "/api/admin/tables", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+adminToken)
	w := httptest.NewRecorder()
	srv.ServeHTTP(w, req)

	body, _ = json.Marshal(map[string]interface{}{"table_number": num, "password": pass})
	req = httptest.NewRequest("POST", "/api/table/auth", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	srv.ServeHTTP(w, req)
	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	return resp["token"].(string)
}
