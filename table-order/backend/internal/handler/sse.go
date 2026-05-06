package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/table-order/backend/internal/auth"
	"github.com/table-order/backend/internal/model"
	"github.com/table-order/backend/internal/sse"
)

type SSEHandler struct {
	broker   *sse.Broker
	tokenMgr *auth.TokenManager
}

func NewSSEHandler(broker *sse.Broker, tokenMgr *auth.TokenManager) *SSEHandler {
	return &SSEHandler{broker: broker, tokenMgr: tokenMgr}
}

func (h *SSEHandler) CustomerStream(w http.ResponseWriter, r *http.Request) {
	tableID, err := strconv.Atoi(r.PathValue("tableId"))
	if err != nil || tableID <= 0 {
		model.ErrValidation([]model.FieldError{{Field: "tableId", Message: "invalid"}}).WriteJSON(w)
		return
	}

	// Validate token from query param (SSE can't set headers)
	token := r.URL.Query().Get("token")
	if token == "" {
		model.ErrTokenInvalid().WriteJSON(w)
		return
	}
	claims, err := h.tokenMgr.ValidateToken(token)
	if err != nil || claims.TokenType != "table" || claims.TableID != tableID {
		model.ErrTokenInvalid().WriteJSON(w)
		return
	}

	h.streamEvents(w, r, func() (<-chan sse.Event, func()) {
		return h.broker.SubscribeTable(tableID)
	})
}

func (h *SSEHandler) AdminStream(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		model.ErrTokenInvalid().WriteJSON(w)
		return
	}
	claims, err := h.tokenMgr.ValidateToken(token)
	if err != nil || claims.TokenType != "admin" {
		model.ErrTokenInvalid().WriteJSON(w)
		return
	}

	h.streamEvents(w, r, func() (<-chan sse.Event, func()) {
		return h.broker.SubscribeAdmin()
	})
}

func (h *SSEHandler) streamEvents(w http.ResponseWriter, r *http.Request, subscribe func() (<-chan sse.Event, func())) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming not supported", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	ch, unsubscribe := subscribe()
	defer unsubscribe()

	// Send initial connection event
	fmt.Fprintf(w, "event: connected\ndata: {}\n\n")
	flusher.Flush()

	heartbeat := time.NewTicker(30 * time.Second)
	defer heartbeat.Stop()

	for {
		select {
		case <-r.Context().Done():
			return
		case <-h.broker.Done():
			return
		case event, ok := <-ch:
			if !ok {
				return
			}
			w.Write(event.Format())
			flusher.Flush()
		case <-heartbeat.C:
			fmt.Fprintf(w, ": ping\n\n")
			flusher.Flush()
		}
	}
}
