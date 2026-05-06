package service

import (
	"testing"

	"github.com/table-order/backend/internal/model"
)

func TestIsValidTransition(t *testing.T) {
	tests := []struct {
		current, next string
		want          bool
	}{
		{model.OrderStatusPending, model.OrderStatusPreparing, true},
		{model.OrderStatusPreparing, model.OrderStatusCompleted, true},
		{model.OrderStatusPending, model.OrderStatusCompleted, false},
		{model.OrderStatusCompleted, model.OrderStatusPending, false},
		{model.OrderStatusCompleted, model.OrderStatusPreparing, false},
		{model.OrderStatusPreparing, model.OrderStatusPending, false},
	}

	for _, tt := range tests {
		got := isValidTransition(tt.current, tt.next)
		if got != tt.want {
			t.Errorf("isValidTransition(%q, %q) = %v, want %v", tt.current, tt.next, got, tt.want)
		}
	}
}

func TestValidateCreateOrderRequest(t *testing.T) {
	tests := []struct {
		name    string
		req     CreateOrderRequest
		wantErr bool
	}{
		{"valid", CreateOrderRequest{Items: []OrderItemRequest{{MenuID: 1, Quantity: 2}}}, false},
		{"empty items", CreateOrderRequest{Items: []OrderItemRequest{}}, true},
		{"zero menu_id", CreateOrderRequest{Items: []OrderItemRequest{{MenuID: 0, Quantity: 1}}}, true},
		{"zero quantity", CreateOrderRequest{Items: []OrderItemRequest{{MenuID: 1, Quantity: 0}}}, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			errs := ValidateCreateOrderRequest(tt.req)
			if (len(errs) > 0) != tt.wantErr {
				t.Errorf("ValidateCreateOrderRequest() errors = %v, wantErr %v", errs, tt.wantErr)
			}
		})
	}
}
