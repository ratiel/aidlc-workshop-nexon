# Customer App - Frontend Components Design

## 1. 컴포넌트 계층 구조

```
App.vue
├── AppLayout.vue (인증된 상태의 레이아웃)
│   ├── AppHeader.vue (상단 헤더 + 햄버거 아이콘)
│   ├── SideDrawer.vue (사이드 네비게이션)
│   ├── <router-view /> (메인 콘텐츠)
│   └── CartBottomSheet.vue (장바구니 하단 시트)
│
├── Views (라우트별 페이지)
│   ├── SetupView.vue (/setup)
│   ├── MenuView.vue (/)
│   ├── OrderConfirmView.vue (/order/confirm)
│   ├── OrderSuccessView.vue (/order/success)
│   └── OrderHistoryView.vue (/orders)
│
└── Components (재사용 컴포넌트)
    ├── menu/
    │   ├── CategoryTabs.vue
    │   ├── MenuCard.vue
    │   └── MenuDetailModal.vue
    ├── cart/
    │   ├── CartItem.vue
    │   └── CartSummary.vue
    ├── order/
    │   ├── OrderCard.vue
    │   └── OrderStatusBadge.vue
    └── common/
        ├── LoadingSpinner.vue
        ├── ErrorMessage.vue
        ├── EmptyState.vue
        ├── ConfirmDialog.vue
        └── ToastNotification.vue
```

---

## 2. Views 상세 설계

### 2.1 SetupView.vue (/setup)

**역할**: 태블릿 초기 설정 (관리자가 1회 수행)

**State**:
```typescript
{
  storeId: string          // 매장 식별자 입력
  tableNumber: string      // 테이블 번호 입력
  password: string         // 비밀번호 입력
  isLoading: boolean       // 인증 요청 중
  errorMessage: string     // 에러 메시지
}
```

**Computed**:
- `isFormValid`: storeId, tableNumber, password 모두 비어있지 않을 때 true

**Methods**:
- `handleSubmit()`: 인증 API 호출 → 성공 시 토큰 저장 + 메뉴 이동

**API 연동**: `POST /api/table/auth`

---

### 2.2 MenuView.vue (/)

**역할**: 카테고리별 메뉴 조회 및 장바구니 추가

**State**:
```typescript
{
  selectedCategoryId: number | null   // 현재 선택된 카테고리
  isMenuDetailOpen: boolean           // 메뉴 상세 모달 열림 여부
  selectedMenu: MenuItem | null       // 선택된 메뉴 (모달용)
}
```

**Pinia Store 사용**: `useMenuStore`, `useCartStore`

**하위 컴포넌트**:
- `CategoryTabs` — 카테고리 탭 목록
- `MenuCard` — 메뉴 카드 (그리드)
- `MenuDetailModal` — 메뉴 상세 모달
- `CartBottomSheet` — 장바구니 하단 시트 (AppLayout에서 제공)

**API 연동**: `GET /api/menu`

---

### 2.3 OrderConfirmView.vue (/order/confirm)

**역할**: 주문 최종 확인 및 확정

**State**:
```typescript
{
  isSubmitting: boolean    // 주문 전송 중
  errorMessage: string     // 에러 메시지
}
```

**Pinia Store 사용**: `useCartStore`, `useOrderStore`, `useAuthStore`

**표시 내용**:
- 장바구니 항목 목록 (메뉴명, 수량, 단가, 소계)
- 총 주문 금액
- "주문 확정" 버튼 + "돌아가기" 버튼

**API 연동**: `POST /api/orders`

---

### 2.4 OrderSuccessView.vue (/order/success)

**역할**: 주문 성공 결과 표시 + 자동 리다이렉트

**State**:
```typescript
{
  orderNumber: string      // 주문 번호
  countdown: number        // 카운트다운 (5 → 0)
}
```

**Lifecycle**:
- `onMounted`: 5초 카운트다운 시작
- 카운트다운 0 도달 시 `/orders` 이동

**Props** (route params 또는 store에서):
- `orderNumber`: 방금 생성된 주문 번호

---

### 2.5 OrderHistoryView.vue (/orders)

**역할**: 현재 세션 주문 내역 조회 + 실시간 업데이트

**State**:
```typescript
{
  isLoading: boolean       // 로딩 중
  errorMessage: string     // 에러 메시지
}
```

**Pinia Store 사용**: `useOrderStore` (SSE로 실시간 업데이트)

**하위 컴포넌트**:
- `OrderCard` — 주문 카드
- `OrderStatusBadge` — 상태 배지
- `EmptyState` — 주문 없을 때

**API 연동**: `GET /api/orders`

---

## 3. Components 상세 설계

### 3.1 AppHeader.vue

**Props**:
```typescript
{
  tableNumber: number      // 테이블 번호 표시
}
```

**Emits**:
- `toggle-drawer`: 사이드 드로어 열기/닫기

**표시**: 햄버거 아이콘 | "테이블 {N}" | (선택적 장바구니 아이콘)

---

### 3.2 SideDrawer.vue

**Props**:
```typescript
{
  isOpen: boolean          // 드로어 열림 상태
  tableNumber: number      // 테이블 번호
  cartSummary: { totalQuantity: number; totalAmount: number }
}
```

**Emits**:
- `close`: 드로어 닫기
- `navigate(path: string)`: 페이지 이동

**메뉴 항목**: 메뉴(/), 주문 내역(/orders)

---

### 3.3 CartBottomSheet.vue

**Props**:
```typescript
{
  isExpanded: boolean      // 펼침 상태
}
```

**Emits**:
- `toggle`: 접기/펼치기 토글
- `checkout`: 주문하기 (→ /order/confirm 이동)

**Pinia Store 사용**: `useCartStore`

**하위 컴포넌트**: `CartItem`, `CartSummary`

---

### 3.4 CategoryTabs.vue

**Props**:
```typescript
{
  categories: Category[]
  selectedId: number | null
}
```

**Emits**:
- `select(categoryId: number)`: 카테고리 선택

---

### 3.5 MenuCard.vue

**Props**:
```typescript
{
  menu: MenuItem
}
```

**Emits**:
- `tap(menu: MenuItem)`: 카드 탭 (상세 모달 열기)
- `add-to-cart(menu: MenuItem)`: 장바구니 추가

---

### 3.6 MenuDetailModal.vue

**Props**:
```typescript
{
  menu: MenuItem | null
  isOpen: boolean
}
```

**Emits**:
- `close`: 모달 닫기
- `add-to-cart(menu: MenuItem)`: 장바구니 추가

---

### 3.7 CartItem.vue

**Props**:
```typescript
{
  item: CartItem
}
```

**Emits**:
- `increment(menuId: number)`: 수량 +1
- `decrement(menuId: number)`: 수량 -1 (1이면 삭제)
- `remove(menuId: number)`: 항목 삭제

---

### 3.8 OrderCard.vue

**Props**:
```typescript
{
  order: Order
}
```

**표시**: 주문 번호, 시각, 메뉴 목록, 금액, 상태 배지

---

### 3.9 OrderStatusBadge.vue

**Props**:
```typescript
{
  status: OrderStatus
}
```

**렌더링**:
| status | 텍스트 | 배경색 |
|--------|--------|--------|
| pending | 대기중 | #FFC107 (노란색) |
| preparing | 준비중 | #2196F3 (파란색) |
| completed | 완료 | #4CAF50 (초록색) |

---

### 3.10 Common Components

#### LoadingSpinner.vue
- Props: `{ size?: 'sm' | 'md' | 'lg' }`
- 중앙 정렬 스피너

#### ErrorMessage.vue
- Props: `{ message: string; retryable?: boolean }`
- Emits: `retry`

#### EmptyState.vue
- Props: `{ message: string; icon?: string }`

#### ConfirmDialog.vue
- Props: `{ isOpen: boolean; title: string; message: string; confirmText?: string; cancelText?: string }`
- Emits: `confirm`, `cancel`

#### ToastNotification.vue
- Props: `{ message: string; type?: 'success' | 'error' | 'info'; duration?: number }`
- 자동 사라짐 (기본 3초)

---

## 4. Pinia Store 구조

### 4.1 useAuthStore

```typescript
interface AuthState {
  token: string | null
  storeId: string | null
  tableId: number | null
  tableNumber: number | null
  status: AuthStatus  // 'authenticated' | 'unauthenticated' | 'loading' | 'error'
}

// Actions
- login(credentials: AuthCredentials): Promise<boolean>
- verifyToken(): Promise<boolean>
- logout(): void
- loadFromStorage(): void
```

### 4.2 useMenuStore

```typescript
interface MenuState {
  categories: Category[]
  menuItems: MenuItem[]
  isLoading: boolean
  error: string | null
}

// Getters
- getMenusByCategory(categoryId: number): MenuItem[]

// Actions
- fetchMenu(): Promise<void>
```

### 4.3 useCartStore

```typescript
interface CartState {
  items: CartItem[]
}

// Getters
- totalAmount: number
- totalQuantity: number
- isEmpty: boolean

// Actions
- addItem(menu: MenuItem): void
- incrementItem(menuId: number): void
- decrementItem(menuId: number): void
- removeItem(menuId: number): void
- clearCart(): void
- loadFromStorage(): void
- saveToStorage(): void
```

### 4.4 useOrderStore

```typescript
interface OrderState {
  orders: Order[]
  lastOrderResult: CreateOrderResponse | null
  isLoading: boolean
  error: string | null
}

// Actions
- createOrder(): Promise<CreateOrderResponse>
- fetchOrders(): Promise<void>
- updateOrderStatus(orderId: number, status: OrderStatus): void
- removeOrder(orderId: number): void
- clearOrders(): void
```

### 4.5 useSSEStore

```typescript
interface SSEState {
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
  reconnectAttempt: number
}

// Actions
- connect(tableId: number): void
- disconnect(): void
- handleEvent(event: SSEEvent): void
```

---

## 5. API 통합 포인트

### 5.1 API 서비스 구조

```
services/
├── api.ts              // 기본 fetch 래퍼 (인증 헤더, 에러 처리)
├── authService.ts      // POST /api/table/auth
├── menuService.ts      // GET /api/menu, GET /api/menu/:categoryId
├── orderService.ts     // POST /api/orders, GET /api/orders
└── sseService.ts       // GET /api/sse/customer/:tableId (EventSource)
```

### 5.2 컴포넌트 ↔ API 매핑

| 컴포넌트/Store | API 엔드포인트 | 메서드 |
|----------------|----------------|--------|
| useAuthStore.login() | /api/table/auth | POST |
| useMenuStore.fetchMenu() | /api/menu | GET |
| useOrderStore.createOrder() | /api/orders | POST |
| useOrderStore.fetchOrders() | /api/orders | GET |
| useSSEStore.connect() | /api/sse/customer/:tableId | GET (EventSource) |

### 5.3 에러 처리 전략

```typescript
// api.ts 기본 래퍼
async function apiRequest<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
  // 1. auth_token에서 Authorization 헤더 추가
  // 2. fetch 실행
  // 3. 401 → 토큰 갱신 시도 → 실패 시 로그아웃
  // 4. 4xx/5xx → ApiError 반환
  // 5. 성공 → data 반환
}
```

---

## 6. 사용자 인터랙션 흐름 요약

### 6.1 첫 방문 (설정)
```
앱 시작 → /setup → 정보 입력 → 인증 → / (메뉴)
```

### 6.2 일반 주문 흐름
```
/ (메뉴) → 카테고리 탐색 → 메뉴 탭 → 모달 → 장바구니 추가
→ 하단 시트 펼치기 → 수량 조절 → "주문하기"
→ /order/confirm → "주문 확정"
→ /order/success (5초) → /orders (주문 내역)
```

### 6.3 추가 주문 흐름
```
/orders → 드로어 → 메뉴 → (일반 주문 흐름 반복)
```

### 6.4 세션 종료 (관리자 이용 완료)
```
(어떤 화면이든) → SSE session_terminated 수신
→ 장바구니 비우기 → 주문 내역 비우기 → / (메뉴) 자동 이동
```
