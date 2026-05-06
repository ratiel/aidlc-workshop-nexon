package auth

import (
	"testing"

	"pgregory.net/rapid"
)

func TestTokenManager_TableToken_RoundTrip(t *testing.T) {
	tm := NewTokenManager("test-secret-key-for-testing-1234")

	rapid.Check(t, func(t *rapid.T) {
		tableID := rapid.IntRange(1, 1000).Draw(t, "tableID")
		tableNumber := rapid.IntRange(1, 100).Draw(t, "tableNumber")

		token, err := tm.GenerateTableToken(tableID, tableNumber)
		if err != nil {
			t.Fatal(err)
		}

		claims, err := tm.ValidateToken(token)
		if err != nil {
			t.Fatal(err)
		}

		if claims.TokenType != "table" {
			t.Fatalf("expected token_type=table, got %s", claims.TokenType)
		}
		if claims.TableID != tableID {
			t.Fatalf("expected table_id=%d, got %d", tableID, claims.TableID)
		}
		if claims.TableNumber != tableNumber {
			t.Fatalf("expected table_number=%d, got %d", tableNumber, claims.TableNumber)
		}
	})
}

func TestTokenManager_AdminToken_RoundTrip(t *testing.T) {
	tm := NewTokenManager("test-secret-key-for-testing-1234")

	rapid.Check(t, func(t *rapid.T) {
		adminID := rapid.IntRange(1, 100).Draw(t, "adminID")
		username := rapid.StringMatching(`[a-z]{3,20}`).Draw(t, "username")

		token, err := tm.GenerateAdminToken(adminID, username)
		if err != nil {
			t.Fatal(err)
		}

		claims, err := tm.ValidateToken(token)
		if err != nil {
			t.Fatal(err)
		}

		if claims.TokenType != "admin" {
			t.Fatalf("expected token_type=admin, got %s", claims.TokenType)
		}
		if claims.AdminID != adminID {
			t.Fatalf("expected admin_id=%d, got %d", adminID, claims.AdminID)
		}
		if claims.Username != username {
			t.Fatalf("expected username=%s, got %s", username, claims.Username)
		}
	})
}

func TestTokenManager_InvalidToken(t *testing.T) {
	tm := NewTokenManager("test-secret")
	_, err := tm.ValidateToken("invalid-token")
	if err == nil {
		t.Fatal("expected error for invalid token")
	}
}

func TestTokenManager_WrongSecret(t *testing.T) {
	tm1 := NewTokenManager("secret-1")
	tm2 := NewTokenManager("secret-2")

	token, _ := tm1.GenerateTableToken(1, 1)
	_, err := tm2.ValidateToken(token)
	if err == nil {
		t.Fatal("expected error for wrong secret")
	}
}
