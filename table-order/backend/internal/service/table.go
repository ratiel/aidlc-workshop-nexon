package service

import (
	"time"

	"github.com/table-order/backend/internal/model"
	"github.com/table-order/backend/internal/repository"
	"github.com/table-order/backend/internal/sse"
	"golang.org/x/crypto/bcrypt"
)

type TableService struct {
	tableRepo *repository.TableRepository
	orderRepo *repository.OrderRepository
	broker    *sse.Broker
}

func NewTableService(tableRepo *repository.TableRepository, orderRepo *repository.OrderRepository, broker *sse.Broker) *TableService {
	return &TableService{tableRepo: tableRepo, orderRepo: orderRepo, broker: broker}
}

func (s *TableService) CreateTable(tableNumber int, password string) (*model.Table, error) {
	existing, err := s.tableRepo.GetByNumber(tableNumber)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, model.ErrTableNumberExists()
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return nil, err
	}

	table := &model.Table{
		TableNumber:  tableNumber,
		PasswordHash: string(hash),
	}
	if err := s.tableRepo.Create(table); err != nil {
		return nil, err
	}
	return table, nil
}

func (s *TableService) CompleteSession(tableID int) error {
	table, err := s.tableRepo.GetByID(tableID)
	if err != nil {
		return err
	}
	if table == nil {
		return model.ErrNotFound("TABLE")
	}
	if table.SessionStatus == model.SessionStatusIdle {
		return model.ErrNoActiveSession()
	}
	if table.SessionStatus == model.SessionStatusCompleting {
		return model.ErrNoActiveSession()
	}

	// Set COMPLETING to reject new orders
	if err := s.tableRepo.UpdateSession(table.ID, table.CurrentSession, model.SessionStatusCompleting); err != nil {
		return err
	}

	// Complete: clear session
	if err := s.tableRepo.UpdateSession(table.ID, nil, model.SessionStatusIdle); err != nil {
		return err
	}

	now := time.Now()
	s.broker.PublishToTable(tableID, sse.Event{
		Type:    "session_completed",
		Payload: map[string]interface{}{"table_id": tableID, "completed_at": now},
	})
	s.broker.PublishToAdmin(sse.Event{
		Type:    "table_session_completed",
		Payload: map[string]interface{}{"table_id": tableID, "table_number": table.TableNumber, "completed_at": now},
	})
	return nil
}

func (s *TableService) GetHistory(tableID int, dateFrom, dateTo string) ([]model.OrderWithItems, error) {
	table, err := s.tableRepo.GetByID(tableID)
	if err != nil {
		return nil, err
	}
	if table == nil {
		return nil, model.ErrNotFound("TABLE")
	}

	currentSession := ""
	if table.CurrentSession != nil {
		currentSession = *table.CurrentSession
	}
	return s.orderRepo.GetHistoryByTable(tableID, currentSession, dateFrom, dateTo)
}
