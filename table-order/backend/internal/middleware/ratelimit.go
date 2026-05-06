package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/table-order/backend/internal/model"
)

type RateLimiter struct {
	mu           sync.Mutex
	general      map[string][]time.Time
	login        map[string][]time.Time
	generalLimit int
	loginLimit   int
	window       time.Duration
}

func NewRateLimiter(generalLimit, loginLimit int) *RateLimiter {
	rl := &RateLimiter{
		general:      make(map[string][]time.Time),
		login:        make(map[string][]time.Time),
		generalLimit: generalLimit,
		loginLimit:   loginLimit,
		window:       time.Minute,
	}
	go rl.cleanup()
	return rl
}

func (rl *RateLimiter) GeneralLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := GetClientIP(r)
		if !rl.allow(rl.general, ip, rl.generalLimit) {
			w.Header().Set("Retry-After", "60")
			model.ErrRateLimitExceeded().WriteJSON(w)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (rl *RateLimiter) LoginLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := GetClientIP(r)
		if !rl.allow(rl.login, ip, rl.loginLimit) {
			w.Header().Set("Retry-After", "60")
			model.ErrRateLimitExceeded().WriteJSON(w)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (rl *RateLimiter) allow(store map[string][]time.Time, key string, limit int) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-rl.window)

	// Remove expired entries
	timestamps := store[key]
	valid := timestamps[:0]
	for _, t := range timestamps {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}

	if len(valid) >= limit {
		store[key] = valid
		return false
	}

	store[key] = append(valid, now)
	return true
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		cutoff := time.Now().Add(-rl.window)
		for k, v := range rl.general {
			valid := v[:0]
			for _, t := range v {
				if t.After(cutoff) {
					valid = append(valid, t)
				}
			}
			if len(valid) == 0 {
				delete(rl.general, k)
			} else {
				rl.general[k] = valid
			}
		}
		for k, v := range rl.login {
			valid := v[:0]
			for _, t := range v {
				if t.After(cutoff) {
					valid = append(valid, t)
				}
			}
			if len(valid) == 0 {
				delete(rl.login, k)
			} else {
				rl.login[k] = valid
			}
		}
		rl.mu.Unlock()
	}
}
