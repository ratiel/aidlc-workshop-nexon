# Admin App — 도메인 엔티티 (TypeScript 인터페이스)

## 1. 핵심 데이터 모델

### Order (주문)
```typescript
interface Order {
  id: string;
  orderNumber: string;
  tableId: string;
  tableNumber: number;
  sessionId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string; // ISO 8601
}

interface OrderItem {
  menuId: string;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED';
```

### Table (테이블)
```typescript
interface Table {
  id: string;
  tableNumber: number;
  sessionId: string | null;
  currentOrders: Order[];
  totalAmount: number;
  lastOrderAt: string | null; // ISO 8601
  isHighlighted: boolean; // 신규 주문 강조
}
```

### OrderHistory (과거 주문 내역)
```typescript
interface OrderHistory {
  id: string;
  orderNumber: string;
  tableNumber: number;
  sessionId: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  completedAt: string; // 이용 완료 시각
}
```

### Admin (관리자)
```typescript
interface AdminCredentials {
  storeId: string;
  username: string;
  password: string;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  storeId: string | null;
}
```

---

## 2. SSE 이벤트 타입

```typescript
type SSEEventType = 
  | 'new_order'
  | 'order_status_changed'
  | 'order_deleted'
  | 'table_completed';

interface SSENewOrderEvent {
  type: 'new_order';
  data: Order;
}

interface SSEOrderStatusChangedEvent {
  type: 'order_status_changed';
  data: {
    orderId: string;
    tableId: string;
    newStatus: OrderStatus;
  };
}

interface SSEOrderDeletedEvent {
  type: 'order_deleted';
  data: {
    orderId: string;
    tableId: string;
    newTotalAmount: number;
  };
}

interface SSETableCompletedEvent {
  type: 'table_completed';
  data: {
    tableId: string;
  };
}

type SSEEvent = 
  | SSENewOrderEvent 
  | SSEOrderStatusChangedEvent 
  | SSEOrderDeletedEvent 
  | SSETableCompletedEvent;
```

---

## 3. API 응답 타입

### 로그인 응답
```typescript
interface LoginResponse {
  token: string;
  expiresAt: string; // ISO 8601
}
```

### 주문 목록 응답
```typescript
interface OrdersResponse {
  orders: Order[];
}
```

### 과거 내역 응답
```typescript
interface OrderHistoryResponse {
  history: OrderHistory[];
  total: number;
}

interface OrderHistoryQuery {
  tableId: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  page?: number;
  limit?: number;
}
```

### 공통 에러 응답
```typescript
interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
```

---

## 4. Pinia Store 구조

### authStore
```typescript
// stores/auth.ts
interface AuthStore {
  // State
  token: string | null;
  isAuthenticated: boolean;
  storeId: string | null;

  // Actions
  login(credentials: AdminCredentials): Promise<void>;
  logout(): void;
  checkAuth(): boolean;
  getAuthHeader(): { Authorization: string } | {};
}
```

### ordersStore
```typescript
// stores/orders.ts
interface OrdersStore {
  // State
  tables: Map<string, Table>;
  selectedTableId: string | null;
  isLoading: boolean;
  error: string | null;
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected';

  // Getters
  sortedTables: Table[]; // 최신 주문 시간 순
  selectedTable: Table | null;
  highlightedTables: Table[]; // 강조 표시된 테이블

  // Actions
  fetchOrders(): Promise<void>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
  deleteOrder(orderId: string): Promise<void>;
  completeTable(tableId: string): Promise<void>;
  acknowledgeTable(tableId: string): void; // 강조 해제

  // SSE Handlers
  handleNewOrder(order: Order): void;
  handleOrderStatusChanged(data: { orderId: string; tableId: string; newStatus: OrderStatus }): void;
  handleOrderDeleted(data: { orderId: string; tableId: string; newTotalAmount: number }): void;
  handleTableCompleted(data: { tableId: string }): void;
}
```

### historyStore
```typescript
// stores/history.ts
interface HistoryStore {
  // State
  history: OrderHistory[];
  isLoading: boolean;
  error: string | null;
  filters: {
    startDate: string | null;
    endDate: string | null;
  };

  // Actions
  fetchHistory(tableId: string, query?: OrderHistoryQuery): Promise<void>;
  setDateFilter(startDate: string | null, endDate: string | null): void;
  clearFilters(): void;
}
```

---

## 5. API 서비스 인터페이스

```typescript
// services/api.ts
interface AdminApiService {
  // Auth
  login(credentials: AdminCredentials): Promise<LoginResponse>;

  // Orders
  getOrders(): Promise<OrdersResponse>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;
  deleteOrder(orderId: string): Promise<void>;

  // Tables
  completeTable(tableId: string): Promise<void>;
  getTableHistory(tableId: string, query?: OrderHistoryQuery): Promise<OrderHistoryResponse>;
  setupTable(tableNumber: number, password: string): Promise<void>;
}
```

```typescript
// services/sse.ts
interface SSEService {
  connect(): void;
  disconnect(): void;
  onEvent(handler: (event: SSEEvent) => void): void;
  getConnectionStatus(): 'connected' | 'reconnecting' | 'disconnected';
}
```
