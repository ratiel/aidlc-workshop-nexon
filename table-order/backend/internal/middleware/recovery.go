package middleware

import (
	"log/slog"
	"net/http"
	"runtime/debug"

	"github.com/table-order/backend/internal/model"
)

func Recovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				slog.Error("panic recovered", "error", err, "stack", string(debug.Stack()))
				model.ErrInternal().WriteJSON(w)
			}
		}()
		next.ServeHTTP(w, r)
	})
}
