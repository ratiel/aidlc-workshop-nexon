package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	Port          string
	DBPath        string
	JWTSecret     string
	AdminUsername string
	AdminPassword string
	CORSOrigins   []string
	StoreID       string
}

func Load() (*Config, error) {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET environment variable is required")
	}
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		return nil, fmt.Errorf("ADMIN_PASSWORD environment variable is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./data/tableorder.db"
	}
	adminUsername := os.Getenv("ADMIN_USERNAME")
	if adminUsername == "" {
		adminUsername = "admin"
	}
	corsOriginsStr := os.Getenv("CORS_ORIGINS")
	if corsOriginsStr == "" {
		corsOriginsStr = "http://localhost:3000,http://localhost:3001"
	}
	corsOrigins := strings.Split(corsOriginsStr, ",")
	for i := range corsOrigins {
		corsOrigins[i] = strings.TrimSpace(corsOrigins[i])
	}
	storeID := os.Getenv("STORE_ID")
	if storeID == "" {
		storeID = "default"
	}

	return &Config{
		Port:          port,
		DBPath:        dbPath,
		JWTSecret:     jwtSecret,
		AdminUsername: adminUsername,
		AdminPassword: adminPassword,
		CORSOrigins:   corsOrigins,
		StoreID:       storeID,
	}, nil
}
