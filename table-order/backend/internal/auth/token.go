package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	jwt.RegisteredClaims
	TokenType   string `json:"token_type"`
	TableID     int    `json:"table_id,omitempty"`
	TableNumber int    `json:"table_number,omitempty"`
	AdminID     int    `json:"admin_id,omitempty"`
	Username    string `json:"username,omitempty"`
}

type TokenManager struct {
	secret []byte
}

func NewTokenManager(secret string) *TokenManager {
	return &TokenManager{secret: []byte(secret)}
}

func (tm *TokenManager) GenerateTableToken(tableID, tableNumber int) (string, error) {
	claims := &Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt: jwt.NewNumericDate(time.Now()),
		},
		TokenType:   "table",
		TableID:     tableID,
		TableNumber: tableNumber,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(tm.secret)
}

func (tm *TokenManager) GenerateAdminToken(adminID int, username string) (string, error) {
	claims := &Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(16 * time.Hour)),
		},
		TokenType: "admin",
		AdminID:   adminID,
		Username:  username,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(tm.secret)
}

func (tm *TokenManager) ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return tm.secret, nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, jwt.ErrSignatureInvalid
	}
	return claims, nil
}
