# Customer App - Domain Entities

## TypeScript 타입 정의

### 인증 관련

```typescript
/** 태블릿 인증 정보 (localStorage 저장) */
interface AuthCredentials {
  storeId: string
  tableNumber: number
  password: string
}

/** 인증 토큰 정보 (localStorage 저장) */
interface AuthToken {
  token: string
  tableId: number
  storeId: string
  tableNumber: number
}

/** 인증 상태 */
type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading' | 'error'
```

### 메뉴 관련

```typescript
/** 메뉴 카테고리 */
interface Category {
  id: number
  name: string
}

/** 메뉴 항목 */
interface MenuItem {
  id: number
  name: string
  price: number
  description: string
  imageUrl: string
  categoryId: number
}

/** 카테고리별 메뉴 그룹 */
interface CategoryWithMenus {
  category: Category
  items: MenuItem[]
}
```

### 장바구니 관련

```typescript
/** 장바구니 항목 */
interface CartItem {
  menuId: number
  name: string
  price: number
  quantity: number
  imageUrl: string
}

/** 장바구니 상태 */
interface CartState {
  items: CartItem[]
  totalAmount: number
  totalQuantity: number
}
```

### 주문 관련

```typescript
/** 주문 상태 */
type OrderStatus = 'pending' | 'preparing' | 'completed'

/** 주문 항목 (서버 전송용) */
interface OrderItemRequest {
  menuId: number
  name: string
  quantity: number
  price: number
}

/** 주문 생성 요청 */
interface CreateOrderRequest {
  storeId: string
  tableId: number
  sessionId: string
  items: OrderItemRequest[]
  totalAmount: number
}

/** 주문 생성 응답 */
interface CreateOrderResponse {
  orderId: number
  orderNumber: string
  createdAt: string
}

/** 주문 항목 (조회용) */
interface OrderItem {
  menuId: number
  name: string
  quantity: number
  price: number
  subtotal: number
}

/** 주문 (조회용) */
interface Order {
  id: number
  orderNumber: string
  status: OrderStatus
  items: OrderItem[]
  totalAmount: number
  createdAt: string
}
```

### SSE 이벤트 관련

```typescript
/** SSE 이벤트 타입 */
type SSEEventType =
  | 'order_status_changed'
  | 'session_terminated'
  | 'order_deleted'
  | 'connected'

/** 주문 상태 변경 이벤트 */
interface OrderStatusChangedEvent {
  type: 'order_status_changed'
  orderId: number
  orderNumber: string
  newStatus: OrderStatus
}

/** 세션 종료 이벤트 */
interface SessionTerminatedEvent {
  type: 'session_terminated'
  tableId: number
}

/** 주문 삭제 이벤트 */
interface OrderDeletedEvent {
  type: 'order_deleted'
  orderId: number
}

/** SSE 이벤트 유니온 */
type SSEEvent =
  | OrderStatusChangedEvent
  | SessionTerminatedEvent
  | OrderDeletedEvent
```

### API 에러 관련

```typescript
/** API 에러 응답 */
interface ApiError {
  code: string
  message: string
}

/** API 응답 래퍼 */
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError }
```

---

## 엔티티 관계도

```
AuthToken
  └── storeId, tableId, tableNumber
       │
       ├── Menu API 호출 시 인증 헤더로 사용
       ├── Order 생성 시 storeId, tableId 포함
       └── SSE 연결 시 tableId로 스트림 구독

Category (1) ──── (N) MenuItem
                        │
                        └── CartItem으로 변환 (장바구니 추가 시)

CartItem (N) ──── (1) Cart (localStorage)
                        │
                        └── CreateOrderRequest로 변환 (주문 확정 시)

Order (1) ──── (N) OrderItem
  │
  └── SSE로 status 실시간 업데이트
```

---

## localStorage 스키마

| Key | Type | 설명 |
|-----|------|------|
| `auth_credentials` | `AuthCredentials` | 매장ID, 테이블번호, 비밀번호 |
| `auth_token` | `AuthToken` | 인증 토큰 및 테이블 정보 |
| `cart_items` | `CartItem[]` | 장바구니 항목 목록 |
