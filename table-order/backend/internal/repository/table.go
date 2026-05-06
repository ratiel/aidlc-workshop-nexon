package repository

import (
	"database/sql"

	"github.com/table-order/backend/internal/model"
)

type TableRepository struct {
	db *sql.DB
}

func NewTableRepository(db *sql.DB) *TableRepository {
	return &TableRepository{db: db}
}

func (r *TableRepository) GetByNumber(tableNumber int) (*model.Table, error) {
	var t model.Table
	var session sql.NullString
	err := r.db.QueryRow(
		"SELECT id, table_number, password_hash, current_session, session_status, created_at FROM tables WHERE table_number = ?",
		tableNumber,
	).Scan(&t.ID, &t.TableNumber, &t.PasswordHash, &session, &t.SessionStatus, &t.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if session.Valid {
		t.CurrentSession = &session.String
	}
	return &t, nil
}

func (r *TableRepository) GetByID(id int) (*model.Table, error) {
	var t model.Table
	var session sql.NullString
	err := r.db.QueryRow(
		"SELECT id, table_number, password_hash, current_session, session_status, created_at FROM tables WHERE id = ?", id,
	).Scan(&t.ID, &t.TableNumber, &t.PasswordHash, &session, &t.SessionStatus, &t.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if session.Valid {
		t.CurrentSession = &session.String
	}
	return &t, nil
}

func (r *TableRepository) Create(table *model.Table) error {
	res, err := r.db.Exec(
		"INSERT INTO tables (table_number, password_hash) VALUES (?, ?)",
		table.TableNumber, table.PasswordHash,
	)
	if err != nil {
		return err
	}
	id, _ := res.LastInsertId()
	table.ID = int(id)
	return nil
}

func (r *TableRepository) UpdateSession(id int, sessionID *string, status string) error {
	_, err := r.db.Exec(
		"UPDATE tables SET current_session = ?, session_status = ? WHERE id = ?",
		sessionID, status, id,
	)
	return err
}

func (r *TableRepository) GetAll() ([]model.Table, error) {
	rows, err := r.db.Query("SELECT id, table_number, password_hash, current_session, session_status, created_at FROM tables ORDER BY table_number")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tables []model.Table
	for rows.Next() {
		var t model.Table
		var session sql.NullString
		if err := rows.Scan(&t.ID, &t.TableNumber, &t.PasswordHash, &session, &t.SessionStatus, &t.CreatedAt); err != nil {
			return nil, err
		}
		if session.Valid {
			t.CurrentSession = &session.String
		}
		tables = append(tables, t)
	}
	return tables, rows.Err()
}
