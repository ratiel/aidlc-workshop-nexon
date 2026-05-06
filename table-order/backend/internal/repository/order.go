package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/table-order/backend/internal/model"
)

type OrderRepository struct {
	db *sql.DB
}

func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) Create(order *model.Order, items []model.OrderItem) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	res, err := tx.Exec(
		"INSERT INTO orders (table_id, session_id, order_number, status, total_amount) VALUES (?, ?, ?, ?, ?)",
		order.TableID, order.SessionID, order.OrderNumber, order.Status, order.TotalAmount,
	)
	if err != nil {
		return err
	}
	orderID, _ := res.LastInsertId()
	order.ID = int(orderID)

	for i := range items {
		_, err := tx.Exec(
			"INSERT INTO order_items (order_id, menu_id, menu_name, quantity, unit_price) VALUES (?, ?, ?, ?, ?)",
			order.ID, items[i].MenuID, items[i].MenuName, items[i].Quantity, items[i].UnitPrice,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *OrderRepository) GetBySession(tableID int, sessionID string) ([]model.OrderWithItems, error) {
	rows, err := r.db.Query(
		"SELECT id, table_id, session_id, order_number, status, total_amount, created_at, updated_at FROM orders WHERE table_id = ? AND session_id = ? ORDER BY created_at DESC",
		tableID, sessionID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []model.OrderWithItems
	for rows.Next() {
		var o model.OrderWithItems
		if err := rows.Scan(&o.ID, &o.TableID, &o.SessionID, &o.OrderNumber, &o.Status, &o.TotalAmount, &o.CreatedAt, &o.UpdatedAt); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	for i := range orders {
		items, err := r.GetItemsByOrderID(orders[i].ID)
		if err != nil {
			return nil, err
		}
		orders[i].Items = items
	}
	return orders, nil
}

func (r *OrderRepository) GetItemsByOrderID(orderID int) ([]model.OrderItem, error) {
	rows, err := r.db.Query(
		"SELECT id, order_id, menu_id, menu_name, quantity, unit_price FROM order_items WHERE order_id = ?", orderID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []model.OrderItem
	for rows.Next() {
		var item model.OrderItem
		if err := rows.Scan(&item.ID, &item.OrderID, &item.MenuID, &item.MenuName, &item.Quantity, &item.UnitPrice); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *OrderRepository) GetByID(id int) (*model.Order, error) {
	var o model.Order
	err := r.db.QueryRow(
		"SELECT id, table_id, session_id, order_number, status, total_amount, created_at, updated_at FROM orders WHERE id = ?", id,
	).Scan(&o.ID, &o.TableID, &o.SessionID, &o.OrderNumber, &o.Status, &o.TotalAmount, &o.CreatedAt, &o.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &o, err
}

func (r *OrderRepository) UpdateStatus(id int, status string) error {
	_, err := r.db.Exec("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?", status, id)
	return err
}

func (r *OrderRepository) Delete(id int) error {
	_, err := r.db.Exec("DELETE FROM orders WHERE id = ?", id)
	return err
}

func (r *OrderRepository) GetNextOrderNumber(date string) (string, error) {
	var maxNum sql.NullString
	err := r.db.QueryRow(
		"SELECT order_number FROM orders WHERE order_number LIKE ? ORDER BY order_number DESC LIMIT 1",
		date+"-%",
	).Scan(&maxNum)
	if err != nil && err != sql.ErrNoRows {
		return "", err
	}

	seq := 1
	if maxNum.Valid {
		fmt.Sscanf(maxNum.String, date+"-%d", &seq)
		seq++
	}
	return fmt.Sprintf("%s-%03d", date, seq), nil
}

func (r *OrderRepository) GetByTableAllOrders(tableID int) ([]model.OrderWithItems, error) {
	rows, err := r.db.Query(
		"SELECT id, table_id, session_id, order_number, status, total_amount, created_at, updated_at FROM orders WHERE table_id = ? ORDER BY created_at DESC",
		tableID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []model.OrderWithItems
	for rows.Next() {
		var o model.OrderWithItems
		if err := rows.Scan(&o.ID, &o.TableID, &o.SessionID, &o.OrderNumber, &o.Status, &o.TotalAmount, &o.CreatedAt, &o.UpdatedAt); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	for i := range orders {
		items, err := r.GetItemsByOrderID(orders[i].ID)
		if err != nil {
			return nil, err
		}
		orders[i].Items = items
	}
	return orders, nil
}

func (r *OrderRepository) GetHistoryByTable(tableID int, currentSession string, dateFrom, dateTo string) ([]model.OrderWithItems, error) {
	query := "SELECT id, table_id, session_id, order_number, status, total_amount, created_at, updated_at FROM orders WHERE table_id = ?"
	args := []interface{}{tableID}

	if currentSession != "" {
		query += " AND session_id != ?"
		args = append(args, currentSession)
	}
	if dateFrom != "" {
		query += " AND created_at >= ?"
		args = append(args, dateFrom)
	}
	if dateTo != "" {
		t, _ := time.Parse("2006-01-02", dateTo)
		query += " AND created_at < ?"
		args = append(args, t.AddDate(0, 0, 1).Format("2006-01-02"))
	}
	query += " ORDER BY created_at DESC"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []model.OrderWithItems
	for rows.Next() {
		var o model.OrderWithItems
		if err := rows.Scan(&o.ID, &o.TableID, &o.SessionID, &o.OrderNumber, &o.Status, &o.TotalAmount, &o.CreatedAt, &o.UpdatedAt); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	for i := range orders {
		items, err := r.GetItemsByOrderID(orders[i].ID)
		if err != nil {
			return nil, err
		}
		orders[i].Items = items
	}
	return orders, nil
}
