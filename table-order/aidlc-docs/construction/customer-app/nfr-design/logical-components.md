# Customer App - Logical Components

## 아키텍처 개요

```
+------------------------------------------------------------------+
|                        App Shell                                  |
|  +------------------------------------------------------------+  |
|  |  Router (Vue Router + Guards)                               |  |
|  +------------------------------------------------------------+  |
|  |  Views (SetupView, MenuView, OrderConfirm, etc.)           |  |
|  +------------------------------------------------------------+  |
|  |  Components (MenuCard, CartItem, OrderCard, etc.)           |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  +------------------------------------------------------------+  |
|  |  State Layer (Pinia Stores)                                 |  |
|  |  +----------+ +--------+ +-------+ +-------+ +-----+       |  |
|  |  | AuthStore| |MenuStore| |CartStore| |OrderStore| |SSEStore| |  |
|  |  +----------+ +--------+ +-------+ +-------+ +-----+       |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  +------------------------------------------------------------+  |
|  |  Service Layer                                              |  |
|  |  +----------+ +----------+ +----------+ +----------+       |  |
|  |  |HttpClient| |SSEManager| |StorageMgr| |ToastMgr  |       |  |
|  |  +----------+ +----------+ +----------+ +----------+       |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
+------------------------------------------------------------------+
                               |
                    +----------+----------+
                    |   Backend API       |
                    |   (REST + SSE)      |
                    +---------------------+
```

---

## 1. HTTP Client (서비스 레이어)

### 역할
- 모든 REST API 호출의 단일 진입점
- 인증 헤더 자동 추가
- 에러 처리 표준화
- 401 시 자동 토큰 갱신

### 인터페이스

```typescript
// services/api.ts
interface HttpClient {
  get<T>(url: string): Promise<ApiResult<T>>
  post<T>(url: string, body: unknown): Promise<ApiResult<T>>
  patch<T>(url: string, body: unknown): Promise<ApiResult<T>>
  delete<T>(url: string): Promise<ApiResult<T>>
}
```

### 내부 동작

```
요청 흐름:
  1. URL 구성 (VITE_API_BASE_URL + path)
  2. Authorization 헤더 추가 (auth_token)
  3. fetch 실행
  4. 응답 처리:
     - 401 → handleUnauthorized (재인증 1회 시도)
     - 2xx → JSON 파싱 → ApiResult<T> 반환
     - 4xx/5xx → ApiError 구성 → ApiResult 반환
     - 네트워크 에러 → NETWORK_ERROR 반환
```

### 설정

```typescript
const config = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,  // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json'
  }
}
```

---

## 2. SSE Manager (서비스 레이어)

### 역할
- EventSource 연결 관리
- 이벤트 수신 및 디스패치
- 자동 재연결 (지수 백오프, 무제한)
- 연결 상태 추적

### 인터페이스

```typescript
// services/sseService.ts
interface SSEManager {
  connect(tableId: number, token: string): void
  disconnect(): void
  onEvent(handler: (event: SSEEvent) => void): void
  getStatus(): 'connected' | 'disconnected' | 'reconnecting'
}
```

### 내부 동작

```
연결 흐름:
  1. EventSource 생성: /api/sse/customer/{tableId}?token={token}
  2. onopen → status = 'connected', reconnector.reset()
  3. onmessage → JSON 파싱 → 이벤트 핸들러 호출
  4. onerror → status = 'reconnecting'
     → reconnector.getNextDelay() 후 재연결 시도

이벤트 디스패치:
  - order_status_changed → orderStore.updateOrderStatus()
  - order_deleted → orderStore.removeOrder()
  - session_terminated → 전체 초기화 (cart, order, sse)
```

### 재연결 설정

```typescript
const reconnectConfig = {
  baseDelay: 1000,      // 1초
  maxDelay: 30000,      // 30초
  maxAttempts: Infinity, // 무제한
  jitterFactor: 0.1     // ±10%
}
```

---

## 3. Storage Manager (서비스 레이어)

### 역할
- localStorage 안전한 읽기/쓰기
- JSON 직렬화/역직렬화 에러 처리
- 스키마 검증 (타입 가드)
- 데이터 손상 시 기본값 반환

### 인터페이스

```typescript
// services/storageService.ts
interface StorageManager {
  get<T>(key: string, validator?: (data: unknown) => data is T): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
  clear(): void
}
```

### 내부 동작

```
읽기 흐름:
  1. localStorage.getItem(key)
  2. null이면 → null 반환
  3. JSON.parse() 시도
     - 실패 → localStorage.removeItem(key) → null 반환
  4. validator 있으면 검증
     - 실패 → localStorage.removeItem(key) → null 반환
  5. 성공 → T 반환

쓰기 흐름:
  1. JSON.stringify(value)
  2. localStorage.setItem(key, serialized)
  3. QuotaExceededError → 오래된 데이터 정리 시도
```

### 저장 키 상수

```typescript
const STORAGE_KEYS = {
  AUTH_CREDENTIALS: 'auth_credentials',
  AUTH_TOKEN: 'auth_token',
  CART_ITEMS: 'cart_items'
} as const
```

---

## 4. Toast Manager (서비스 레이어)

### 역할
- 토스트 알림 표시/제거
- 자동 사라짐 (기본 3초)
- 큐 관리 (최대 3개 동시 표시)
- 접근성 (aria-live)

### 인터페이스

```typescript
// services/toastService.ts
interface ToastManager {
  success(message: string, duration?: number): void
  error(message: string, duration?: number): void
  info(message: string, duration?: number): void
  dismiss(id: string): void
}

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  duration: number
  createdAt: number
}
```

### 내부 동작

```
표시 흐름:
  1. Toast 객체 생성 (고유 ID)
  2. 토스트 큐에 추가 (최대 3개, 초과 시 가장 오래된 것 제거)
  3. setTimeout으로 자동 제거 스케줄
  4. aria-live="polite" 영역에 메시지 반영

애니메이션:
  - 진입: 하단에서 슬라이드 업 + 페이드 인 (300ms)
  - 퇴장: 오른쪽으로 슬라이드 + 페이드 아웃 (200ms)
```

---

## 5. Animation Utilities (유틸리티)

### 역할
- Vue Transition 클래스 정의
- 애니메이션 설정 상수
- prefers-reduced-motion 감지

### 인터페이스

```typescript
// utils/animation.ts
interface AnimationConfig {
  duration: {
    fast: number      // 150ms
    normal: number    // 250ms
    slow: number      // 300ms
    emphasis: number  // 500ms
  }
  easing: {
    standard: string  // cubic-bezier(0.4, 0, 0.2, 1)
    enter: string     // cubic-bezier(0, 0, 0.2, 1)
    exit: string      // cubic-bezier(0.4, 0, 1, 1)
  }
}

function usePrefersReducedMotion(): Ref<boolean>
```

### 트랜지션 이름 매핑

| 트랜지션 이름 | 용도 | 지속 시간 |
|--------------|------|-----------|
| `fade` | 일반 페이드 | 200ms |
| `slide-up` | 하단 시트, 토스트 | 250ms |
| `slide-right` | 사이드 드로어 | 250ms |
| `scale` | 모달, 팝업 | 200ms |
| `bounce` | 장바구니 추가 피드백 | 300ms |
| `pulse` | 상태 변경 하이라이트 | 500ms |

---

## 6. Router Guards (라우터 레이어)

### 역할
- 인증 상태 기반 접근 제어
- 페이지 전제 조건 검증
- 리다이렉트 로직

### 가드 체인

```
beforeEach:
  1. AuthGuard: requiresAuth 메타 확인 → 미인증 시 /setup
  2. GuestGuard: /setup 접근 시 인증됨이면 / 리다이렉트
  3. CartGuard: /order/confirm 접근 시 장바구니 비었으면 / 리다이렉트
  4. OrderResultGuard: /order/success 접근 시 결과 없으면 / 리다이렉트
```

---

## 7. 컴포넌트 간 통신 패턴

### 7.1 Props Down, Events Up (기본)

```
Parent → Child: Props (단방향 데이터 흐름)
Child → Parent: Emits (이벤트 발행)
```

### 7.2 Store를 통한 간접 통신

```
ComponentA → Store.action() → Store.state 변경 → ComponentB (reactive)

예시:
  MenuCard → cartStore.addItem() → cartStore.items 변경 → CartBottomSheet 업데이트
```

### 7.3 SSE 이벤트 → Store → Component

```
SSEManager → sseStore.handleEvent() → orderStore/cartStore 업데이트 → 관련 컴포넌트 반응
```

---

## 8. 디렉토리 구조 (최종)

```
frontend/customer/src/
├── main.ts                    # 앱 엔트리포인트
├── App.vue                    # 루트 컴포넌트
├── components/
│   ├── layout/
│   │   ├── AppLayout.vue      # 인증된 상태 레이아웃
│   │   ├── AppHeader.vue      # 상단 헤더
│   │   ├── SideDrawer.vue     # 사이드 네비게이션
│   │   └── CartBottomSheet.vue # 장바구니 하단 시트
│   ├── menu/
│   │   ├── CategoryTabs.vue
│   │   ├── MenuCard.vue
│   │   └── MenuDetailModal.vue
│   ├── cart/
│   │   ├── CartItem.vue
│   │   └── CartSummary.vue
│   ├── order/
│   │   ├── OrderCard.vue
│   │   └── OrderStatusBadge.vue
│   └── common/
│       ├── LoadingSpinner.vue
│       ├── ErrorMessage.vue
│       ├── EmptyState.vue
│       ├── ConfirmDialog.vue
│       ├── ToastNotification.vue
│       └── ErrorBoundary.vue
├── views/
│   ├── SetupView.vue
│   ├── MenuView.vue
│   ├── OrderConfirmView.vue
│   ├── OrderSuccessView.vue
│   └── OrderHistoryView.vue
├── stores/
│   ├── auth.ts
│   ├── menu.ts
│   ├── cart.ts
│   ├── order.ts
│   └── sse.ts
├── services/
│   ├── api.ts                 # HTTP Client
│   ├── authService.ts         # 인증 API
│   ├── menuService.ts         # 메뉴 API
│   ├── orderService.ts        # 주문 API
│   ├── sseService.ts          # SSE Manager
│   ├── storageService.ts      # Storage Manager
│   └── toastService.ts        # Toast Manager
├── router/
│   ├── index.ts               # 라우터 설정
│   └── guards.ts              # 네비게이션 가드
├── types/
│   ├── auth.ts
│   ├── menu.ts
│   ├── cart.ts
│   ├── order.ts
│   ├── sse.ts
│   └── api.ts
├── utils/
│   ├── animation.ts           # 애니메이션 유틸리티
│   ├── format.ts              # 금액 포맷 등
│   └── validation.ts          # 입력 검증
├── directives/
│   └── lazyImage.ts           # 이미지 레이지 로딩
└── __tests__/
    ├── stores/                # Pinia 스토어 테스트
    ├── services/              # 서비스 테스트
    ├── components/            # 컴포넌트 테스트
    ├── utils/                 # 유틸리티 테스트
    └── pbt/                   # PBT 테스트 (fast-check)
```
