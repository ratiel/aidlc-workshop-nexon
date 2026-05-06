package model

import "time"

type Category struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	SortOrder int       `json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
}

type Menu struct {
	ID          int       `json:"id"`
	CategoryID  int       `json:"category_id"`
	Name        string    `json:"name"`
	Price       int       `json:"price"`
	Description string    `json:"description,omitempty"`
	ImageURL    string    `json:"image_url,omitempty"`
	SortOrder   int       `json:"sort_order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Table struct {
	ID             int       `json:"id"`
	TableNumber    int       `json:"table_number"`
	PasswordHash   string    `json:"-"`
	CurrentSession *string   `json:"current_session"`
	SessionStatus  string    `json:"session_status"`
	CreatedAt      time.Time `json:"created_at"`
}

const (
	SessionStatusIdle       = "IDLE"
	SessionStatusActive     = "ACTIVE"
	SessionStatusCompleting = "COMPLETING"
)

type Order struct {
	ID          int       `json:"id"`
	TableID     int       `json:"table_id"`
	SessionID   string    `json:"session_id"`
	OrderNumber string    `json:"order_number"`
	Status      string    `json:"status"`
	TotalAmount int       `json:"total_amount"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

const (
	OrderStatusPending   = "PENDING"
	OrderStatusPreparing = "PREPARING"
	OrderStatusCompleted = "COMPLETED"
)

type OrderItem struct {
	ID        int    `json:"id"`
	OrderID   int    `json:"order_id"`
	MenuID    int    `json:"menu_id"`
	MenuName  string `json:"menu_name"`
	Quantity  int    `json:"quantity"`
	UnitPrice int    `json:"unit_price"`
}

type OrderWithItems struct {
	Order
	Items []OrderItem `json:"items"`
}

type Admin struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}
