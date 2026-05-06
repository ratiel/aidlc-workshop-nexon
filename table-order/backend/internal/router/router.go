package router

import (
	"net/http"

	"github.com/table-order/backend/internal/auth"
	"github.com/table-order/backend/internal/config"
	"github.com/table-order/backend/internal/handler"
	"github.com/table-order/backend/internal/middleware"
)

func New(
	cfg *config.Config,
	tokenMgr *auth.TokenManager,
	rateLimiter *middleware.RateLimiter,
	authHandler *handler.AuthHandler,
	menuHandler *handler.MenuHandler,
	orderHandler *handler.OrderHandler,
	adminOrderHandler *handler.AdminOrderHandler,
	tableHandler *handler.TableHandler,
	sseHandler *handler.SSEHandler,
) http.Handler {
	mux := http.NewServeMux()

	// Public routes (with login rate limit)
	mux.Handle("POST /api/table/auth", rateLimiter.LoginLimit(http.HandlerFunc(authHandler.TableAuth)))
	mux.Handle("POST /api/admin/login", rateLimiter.LoginLimit(http.HandlerFunc(authHandler.AdminLogin)))

	// Table auth routes
	tableAuth := middleware.TableAuth(tokenMgr)
	mux.Handle("GET /api/menu", tableAuth(http.HandlerFunc(menuHandler.GetCategories)))
	mux.Handle("GET /api/menu/{categoryId}", tableAuth(http.HandlerFunc(menuHandler.GetMenusByCategory)))
	mux.Handle("POST /api/orders", tableAuth(http.HandlerFunc(orderHandler.CreateOrder)))
	mux.Handle("GET /api/orders", tableAuth(http.HandlerFunc(orderHandler.GetOrders)))

	// Admin auth routes
	adminAuth := middleware.AdminAuth(tokenMgr)
	mux.Handle("GET /api/admin/orders", adminAuth(http.HandlerFunc(adminOrderHandler.GetAllOrders)))
	mux.Handle("PATCH /api/admin/orders/{id}/status", adminAuth(http.HandlerFunc(adminOrderHandler.UpdateStatus)))
	mux.Handle("DELETE /api/admin/orders/{id}", adminAuth(http.HandlerFunc(adminOrderHandler.DeleteOrder)))
	mux.Handle("POST /api/admin/tables", adminAuth(http.HandlerFunc(tableHandler.CreateTable)))
	mux.Handle("POST /api/admin/tables/{id}/complete", adminAuth(http.HandlerFunc(tableHandler.CompleteSession)))
	mux.Handle("GET /api/admin/tables/{id}/history", adminAuth(http.HandlerFunc(tableHandler.GetHistory)))

	// SSE routes (token via query param)
	mux.HandleFunc("GET /api/sse/customer/{tableId}", sseHandler.CustomerStream)
	mux.HandleFunc("GET /api/sse/admin", sseHandler.AdminStream)

	// Apply global middleware chain
	var h http.Handler = mux
	h = rateLimiter.GeneralLimit(h)
	h = middleware.CORS(cfg.CORSOrigins)(h)
	h = middleware.SecurityHeaders(h)
	h = middleware.Logger(h)
	h = middleware.RequestID(h)
	h = middleware.Recovery(h)

	return h
}
