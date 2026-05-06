package repository

import (
	"database/sql"

	"github.com/table-order/backend/internal/model"
)

type AdminRepository struct {
	db *sql.DB
}

func NewAdminRepository(db *sql.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

func (r *AdminRepository) GetByUsername(username string) (*model.Admin, error) {
	var a model.Admin
	err := r.db.QueryRow(
		"SELECT id, username, password_hash, created_at FROM admins WHERE username = ?", username,
	).Scan(&a.ID, &a.Username, &a.PasswordHash, &a.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &a, err
}

func (r *AdminRepository) Create(admin *model.Admin) error {
	res, err := r.db.Exec(
		"INSERT INTO admins (username, password_hash) VALUES (?, ?)",
		admin.Username, admin.PasswordHash,
	)
	if err != nil {
		return err
	}
	id, _ := res.LastInsertId()
	admin.ID = int(id)
	return nil
}

func (r *AdminRepository) Count() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM admins").Scan(&count)
	return count, err
}
