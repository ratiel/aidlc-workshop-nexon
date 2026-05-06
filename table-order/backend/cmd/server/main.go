package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	slog.SetDefault(logger)

	cfg, err := config.Load()
	if err != nil {
		slog.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	db, err := database.New(cfg.DBPath)
	if err != nil {
		slog.Error("failed to initialize database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	tokenMgr := auth.NewTokenManager(cfg.JWTSecret)
	broker := sse.NewBroker()
	rateLimiter := middleware.NewRateLimiter(120, 10)

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
		slog.Error("failed to seed data", "error", err)
		os.Exit(1)
	}

	authHandler := handler.NewAuthHandler(authSvc)
	menuHandler := handler.NewMenuHandler(menuSvc)
	orderHandler := handler.NewOrderHandler(orderSvc)
	adminOrderHandler := handler.NewAdminOrderHandler(orderSvc)
	tableHandler := handler.NewTableHandler(tableSvc)
	sseHandler := handler.NewSSEHandler(broker, tokenMgr)

	mux := router.New(
		cfg,
		tokenMgr,
		rateLimiter,
		authHandler,
		menuHandler,
		orderHandler,
		adminOrderHandler,
		tableHandler,
		sseHandler,
	)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 0, // SSE requires no write timeout
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		slog.Info("server starting", "port", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("shutting down server")
	broker.Shutdown()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("server forced shutdown", "error", err)
	}
	slog.Info("server stopped")
}
