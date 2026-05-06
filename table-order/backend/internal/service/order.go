package service

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/table-order/backend/internal/model"
	"github.com/table-order/backend/internal/repository"
	"github.com/table-order/backend/internal/sse"
)

type OrderService struct {
	orderRepo *repository.OrderRepository
	menuRepo  *repository.MenuRepository
	tableRepo *repository.TableRepository
	broker    *sse.Broker
}

func NewOrderService(orderRepo *repository.OrderRepository, menuRepo *repository.MenuRepository, tableRepo *repository.TableRepository, broker *sse.Broker) *OrderService {
	return &OrderService{orderRepo: orderRepo, menuRepo: menuRepo, tableRepo: tableRepo, broker: broker}
}

type CreateOrderRequest struct {
	Items []OrderItemRequest `json:"items"`
}

type OrderItemRequest struct {
	MenuID   int `json:"menu_id"`
	Quantity int `json:"quantity"`
}

func (s *OrderService) CreateOrder(tableID int, req CreateOrderRequest) (*model.OrderWithItems, error) {
	table, err := s.tableRepo.GetByID(tableID)
	if err != nil {
		return nil, err
	}
	if table == nil {
		return nil, model.ErrNotFound("TABLE")
	}
	if table.SessionStatus == model.SessionStatusCompleting {
		return nil, model.ErrSessionCompleting()
	}

	// Start session if IDLE
	sessionID := ""
	if table.SessionStatus == model.SessionStatusIdle {
		sessionID = uuid.New().String()
		if err := s.tableRepo.UpdateSession(table.ID, &sessionID, model.SessionStatusActive); err != nil {
			return nil, err
		}
	} else {
		sessionID = *table.CurrentSession
	}

	// Validate menus and calculate total
	var items []model.OrderItem
	totalAmount := 0
	for _, item := range req.Items {
		menu, err := s.menuRepo.GetMenuByID(item.MenuID)
		if err != nil {
			return nil, err
		}
		if menu == nil {
			return nil, model.ErrNotFound("MENU")
		}
		items = append(items, model.OrderItem{
			MenuID:    menu.ID,
			MenuName:  menu.Name,
			Quantity:  item.Quantity,
			UnitPrice: menu.Price,
		})
		totalAmount += menu.Price * item.Quantity
	}

	// Generate order number
	date := time.Now().Format("20060102")
	orderNumber, err := s.orderRepo.GetNextOrderNumber(date)
	if err != nil {
		return nil, err
	}

	order := &model.Order{
		TableID:     tableID,
		SessionID:   sessionID,
		OrderNumber: orderNumber,
		Status:      model.OrderStatusPending,
		TotalAmount: totalAmount,
	}

	if err := s.orderRepo.Create(order, items); err != nil {
		return nil, err
	}

	result := &model.OrderWithItems{Order: *order, Items: items}

	// Publish SSE event
	s.broker.PublishToAdmin(sse.Event{
		Type: "order_created",
		Payload: map[string]interface{}{
			"order_id":     order.ID,
			"table_id":     order.TableID,
			"table_number": table.TableNumber,
			"order_number": order.OrderNumber,
			"total_amount": order.TotalAmount,
			"items":        items,
		},
	})

	return result, nil
}

func (s *OrderService) GetOrdersBySession(tableID int) ([]model.OrderWithItems, error) {
	table, err := s.tableRepo.GetByID(tableID)
	if err != nil {
		return nil, err
	}
	if table == nil || table.CurrentSession == nil {
		return []model.OrderWithItems{}, nil
	}
	return s.orderRepo.GetBySession(tableID, *table.CurrentSession)
}

func (s *OrderService) UpdateStatus(orderID int, newStatus string) error {
	order, err := s.orderRepo.GetByID(orderID)
	if err != nil {
		return err
	}
	if order == nil {
		return model.ErrNotFound("ORDER")
	}

	if !isValidTransition(order.Status, newStatus) {
		return model.ErrInvalidStatusTransition()
	}

	if err := s.orderRepo.UpdateStatus(orderID, newStatus); err != nil {
		return err
	}

	// Publish SSE
	event := sse.Event{
		Type: "order_status_changed",
		Payload: map[string]interface{}{
			"order_id":     order.ID,
			"order_number": order.OrderNumber,
			"old_status":   order.Status,
			"new_status":   newStatus,
		},
	}
	s.broker.PublishToAdmin(event)
	s.broker.PublishToTable(order.TableID, event)
	return nil
}

func (s *OrderService) DeleteOrder(orderID int) error {
	order, err := s.orderRepo.GetByID(orderID)
	if err != nil {
		return err
	}
	if order == nil {
		return model.ErrNotFound("ORDER")
	}

	if err := s.orderRepo.Delete(orderID); err != nil {
		return err
	}

	event := sse.Event{
		Type: "order_deleted",
		Payload: map[string]interface{}{
			"order_id":     order.ID,
			"order_number": order.OrderNumber,
			"table_id":     order.TableID,
		},
	}
	s.broker.PublishToAdmin(event)
	s.broker.PublishToTable(order.TableID, event)
	return nil
}

func (s *OrderService) GetAllOrders() ([]model.OrderWithItems, error) {
	// Get all tables and their current session orders
	tables, err := s.tableRepo.GetAll()
	if err != nil {
		return nil, err
	}
	var allOrders []model.OrderWithItems
	for _, t := range tables {
		if t.CurrentSession == nil {
			continue
		}
		orders, err := s.orderRepo.GetBySession(t.ID, *t.CurrentSession)
		if err != nil {
			return nil, err
		}
		allOrders = append(allOrders, orders...)
	}
	return allOrders, nil
}

func isValidTransition(current, next string) bool {
	transitions := map[string]string{
		model.OrderStatusPending:   model.OrderStatusPreparing,
		model.OrderStatusPreparing: model.OrderStatusCompleted,
	}
	return transitions[current] == next
}

func ValidateCreateOrderRequest(req CreateOrderRequest) []model.FieldError {
	var errs []model.FieldError
	if len(req.Items) == 0 {
		errs = append(errs, model.FieldError{Field: "items", Message: "at least one item is required"})
	}
	for i, item := range req.Items {
		if item.MenuID <= 0 {
			errs = append(errs, model.FieldError{Field: fmt.Sprintf("items[%d].menu_id", i), Message: "must be positive"})
		}
		if item.Quantity <= 0 {
			errs = append(errs, model.FieldError{Field: fmt.Sprintf("items[%d].quantity", i), Message: "must be positive"})
		}
	}
	return errs
}
