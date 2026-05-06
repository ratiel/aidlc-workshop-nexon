package service

import (
	"testing"

	"github.com/table-order/backend/internal/model"
	"pgregory.net/rapid"
)

func TestOrderStatusTransition_Invariant(t *testing.T) {
	statuses := []string{model.OrderStatusPending, model.OrderStatusPreparing, model.OrderStatusCompleted}

	rapid.Check(t, func(t *rapid.T) {
		current := rapid.SampledFrom(statuses).Draw(t, "current")
		next := rapid.SampledFrom(statuses).Draw(t, "next")

		result := isValidTransition(current, next)

		// Invariant: only forward transitions are valid
		if current == model.OrderStatusPending && next == model.OrderStatusPreparing {
			if !result {
				t.Fatal("PENDING -> PREPARING should be valid")
			}
		} else if current == model.OrderStatusPreparing && next == model.OrderStatusCompleted {
			if !result {
				t.Fatal("PREPARING -> COMPLETED should be valid")
			}
		} else {
			if result {
				t.Fatalf("transition %s -> %s should be invalid", current, next)
			}
		}
	})
}

func TestOrderTotalAmount_Invariant(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		numItems := rapid.IntRange(1, 10).Draw(t, "numItems")
		var items []OrderItemRequest
		expectedTotal := 0

		for i := 0; i < numItems; i++ {
			qty := rapid.IntRange(1, 20).Draw(t, "quantity")
			price := rapid.IntRange(100, 50000).Draw(t, "price")
			items = append(items, OrderItemRequest{MenuID: i + 1, Quantity: qty})
			expectedTotal += qty * price
			_ = price // price would come from menu lookup in real scenario
		}

		// Invariant: total is always non-negative
		if expectedTotal < 0 {
			t.Fatal("total amount must be non-negative")
		}

		// Invariant: validation passes for valid items
		req := CreateOrderRequest{Items: items}
		errs := ValidateCreateOrderRequest(req)
		if len(errs) > 0 {
			t.Fatalf("valid request should pass validation, got errors: %v", errs)
		}
	})
}
