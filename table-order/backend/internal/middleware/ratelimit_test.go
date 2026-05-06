package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"pgregory.net/rapid"
)

func TestRateLimiter_AllowsUnderLimit(t *testing.T) {
	rl := NewRateLimiter(5, 3)
	handler := rl.GeneralLimit(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	for i := 0; i < 5; i++ {
		req := httptest.NewRequest("GET", "/test", nil)
		req.RemoteAddr = "192.168.1.1:1234"
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("request %d: expected 200, got %d", i, w.Code)
		}
	}
}

func TestRateLimiter_BlocksOverLimit(t *testing.T) {
	rl := NewRateLimiter(3, 2)
	handler := rl.GeneralLimit(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	for i := 0; i < 3; i++ {
		req := httptest.NewRequest("GET", "/test", nil)
		req.RemoteAddr = "10.0.0.1:1234"
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)
	}

	// 4th request should be blocked
	req := httptest.NewRequest("GET", "/test", nil)
	req.RemoteAddr = "10.0.0.1:1234"
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)
	if w.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429, got %d", w.Code)
	}
}

func TestRateLimiter_Invariant_UnderLimitAlwaysAllowed(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		limit := rapid.IntRange(1, 50).Draw(t, "limit")
		rl := NewRateLimiter(limit, limit)
		numRequests := rapid.IntRange(1, limit).Draw(t, "numRequests")

		handler := rl.GeneralLimit(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		}))

		ip := rapid.StringMatching(`\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}`).Draw(t, "ip")

		for i := 0; i < numRequests; i++ {
			req := httptest.NewRequest("GET", "/", nil)
			req.RemoteAddr = ip + ":1234"
			w := httptest.NewRecorder()
			handler.ServeHTTP(w, req)
			if w.Code != http.StatusOK {
				t.Fatalf("request %d of %d (limit %d) should be allowed, got %d", i+1, numRequests, limit, w.Code)
			}
		}
	})
}
