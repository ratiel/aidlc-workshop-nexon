package repository

import (
	"database/sql"

	"github.com/table-order/backend/internal/model"
)

type MenuRepository struct {
	db *sql.DB
}

func NewMenuRepository(db *sql.DB) *MenuRepository {
	return &MenuRepository{db: db}
}

func (r *MenuRepository) GetCategories() ([]model.Category, error) {
	rows, err := r.db.Query("SELECT id, name, sort_order, created_at FROM categories ORDER BY sort_order, id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []model.Category
	for rows.Next() {
		var c model.Category
		if err := rows.Scan(&c.ID, &c.Name, &c.SortOrder, &c.CreatedAt); err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}
	return categories, rows.Err()
}

func (r *MenuRepository) GetMenusByCategory(categoryID int) ([]model.Menu, error) {
	rows, err := r.db.Query(
		"SELECT id, category_id, name, price, description, image_url, sort_order, created_at, updated_at FROM menus WHERE category_id = ? ORDER BY sort_order, id",
		categoryID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var menus []model.Menu
	for rows.Next() {
		var m model.Menu
		var desc, img sql.NullString
		if err := rows.Scan(&m.ID, &m.CategoryID, &m.Name, &m.Price, &desc, &img, &m.SortOrder, &m.CreatedAt, &m.UpdatedAt); err != nil {
			return nil, err
		}
		m.Description = desc.String
		m.ImageURL = img.String
		menus = append(menus, m)
	}
	return menus, rows.Err()
}

func (r *MenuRepository) GetMenuByID(id int) (*model.Menu, error) {
	var m model.Menu
	var desc, img sql.NullString
	err := r.db.QueryRow(
		"SELECT id, category_id, name, price, description, image_url, sort_order, created_at, updated_at FROM menus WHERE id = ?", id,
	).Scan(&m.ID, &m.CategoryID, &m.Name, &m.Price, &desc, &img, &m.SortOrder, &m.CreatedAt, &m.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	m.Description = desc.String
	m.ImageURL = img.String
	return &m, nil
}

func (r *MenuRepository) CountCategories() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM categories").Scan(&count)
	return count, err
}

func (r *MenuRepository) InsertCategory(name string, sortOrder int) (int64, error) {
	res, err := r.db.Exec("INSERT INTO categories (name, sort_order) VALUES (?, ?)", name, sortOrder)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *MenuRepository) InsertMenu(categoryID int, name string, price int, description, imageURL string, sortOrder int) error {
	_, err := r.db.Exec(
		"INSERT INTO menus (category_id, name, price, description, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
		categoryID, name, price, description, imageURL, sortOrder,
	)
	return err
}
