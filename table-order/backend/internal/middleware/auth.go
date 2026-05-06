package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/table-order/backend/internal/auth"
	"github.com/table-order/backend/internal/model"
)

type claimsKey struct{}

func TableAuth(tokenMgr *auth.TokenManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, err := extractClaims(r, tokenMgr)
			if err != nil {
				model.ErrTokenInvalid().WriteJSON(w)
				return
			}
			if claims.TokenType != "table" {
				model.ErrTokenInvalid().WriteJSON(w)
				return
			}
			ctx := context.WithValue(r.Context(), claimsKey{}, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func AdminAuth(tokenMgr *auth.TokenManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, err := extractClaims(r, tokenMgr)
			if err != nil {
				model.ErrTokenInvalid().WriteJSON(w)
				return
			}
			if claims.TokenType != "admin" {
				model.ErrTokenInvalid().WriteJSON(w)
				return
			}
			ctx := context.WithValue(r.Context(), claimsKey{}, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetClaims(ctx context.Context) *auth.Claims {
	if claims, ok := ctx.Value(claimsKey{}).(*auth.Claims); ok {
		return claims
	}
	return nil
}

func extractClaims(r *http.Request, tokenMgr *auth.TokenManager) (*auth.Claims, error) {
	header := r.Header.Get("Authorization")
	if header == "" {
		return nil, model.ErrTokenInvalid()
	}
	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 || parts[0] != "Bearer" {
		return nil, model.ErrTokenInvalid()
	}
	return tokenMgr.ValidateToken(parts[1])
}
