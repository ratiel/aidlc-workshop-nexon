package sse

import (
	"encoding/json"
	"sync"
)

type Event struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

func (e Event) Format() []byte {
	data, _ := json.Marshal(e.Payload)
	return []byte("event: " + e.Type + "\ndata: " + string(data) + "\n\n")
}

type Broker struct {
	mu             sync.RWMutex
	tableClients   map[int]map[chan Event]struct{}
	adminClients   map[chan Event]struct{}
	done           chan struct{}
}

func NewBroker() *Broker {
	return &Broker{
		tableClients: make(map[int]map[chan Event]struct{}),
		adminClients: make(map[chan Event]struct{}),
		done:         make(chan struct{}),
	}
}

func (b *Broker) SubscribeTable(tableID int) (<-chan Event, func()) {
	ch := make(chan Event, 16)
	b.mu.Lock()
	if b.tableClients[tableID] == nil {
		b.tableClients[tableID] = make(map[chan Event]struct{})
	}
	b.tableClients[tableID][ch] = struct{}{}
	b.mu.Unlock()

	unsubscribe := func() {
		b.mu.Lock()
		delete(b.tableClients[tableID], ch)
		if len(b.tableClients[tableID]) == 0 {
			delete(b.tableClients, tableID)
		}
		b.mu.Unlock()
		close(ch)
	}
	return ch, unsubscribe
}

func (b *Broker) SubscribeAdmin() (<-chan Event, func()) {
	ch := make(chan Event, 16)
	b.mu.Lock()
	b.adminClients[ch] = struct{}{}
	b.mu.Unlock()

	unsubscribe := func() {
		b.mu.Lock()
		delete(b.adminClients, ch)
		b.mu.Unlock()
		close(ch)
	}
	return ch, unsubscribe
}

func (b *Broker) PublishToTable(tableID int, event Event) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	for ch := range b.tableClients[tableID] {
		select {
		case ch <- event:
		default:
		}
	}
}

func (b *Broker) PublishToAdmin(event Event) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	for ch := range b.adminClients {
		select {
		case ch <- event:
		default:
		}
	}
}

func (b *Broker) Shutdown() {
	close(b.done)
	b.mu.Lock()
	defer b.mu.Unlock()
	for _, clients := range b.tableClients {
		for ch := range clients {
			close(ch)
		}
	}
	b.tableClients = make(map[int]map[chan Event]struct{})
	for ch := range b.adminClients {
		close(ch)
	}
	b.adminClients = make(map[chan Event]struct{})
}

func (b *Broker) Done() <-chan struct{} {
	return b.done
}
