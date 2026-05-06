# Customer App - Code Generation Plan

## 유닛 컨텍스트

| 항목 | 내용 |
|------|------|
| **유닛** | Customer App (Unit 2) |
| **기술 스택** | Vue.js 3 + TypeScript + Vite + Pinia + Tailwind CSS + Heroicons |
| **코드 위치** | `frontend/customer/` (워크스페이스 루트 기준) |
| **담당 스토리** | US-1.1~1.5, US-2.1~2.5, US-3.1~3.7, US-4.1~4.5, US-5.1~5.4, US-9.2~9.3 |
| **의존성** | Backend API (REST + SSE) — 개발 시 Mock 사용 |

---

## 코드 생성 단계

### Step 1: 프로젝트 구조 초기화
- [x] Vite + Vue 3 + TypeScript 프로젝트 생성 (`frontend/customer/`)
- [x] package.json 의존성 설정 (vue, vue-router, pinia, tailwindcss, @heroicons/vue, vitest, fast-check, @vue/test-utils)
- [x] vite.config.ts 설정 (alias, proxy, build 최적화)
- [x] tsconfig.json 설정 (strict, paths)
- [x] tailwind.config.js 설정 (커스텀 색상, 터치 영역)
- [x] postcss.config.js 설정
- [x] index.html (viewport meta, 더블탭 줌 방지)
- [x] .env.example (VITE_API_BASE_URL)

### Step 2: 타입 정의 생성
- [x] `src/types/auth.ts` — AuthCredentials, AuthToken, AuthStatus
- [x] `src/types/menu.ts` — Category, MenuItem, CategoryWithMenus
- [x] `src/types/cart.ts` — CartItem, CartState
- [x] `src/types/order.ts` — OrderStatus, Order, OrderItem, CreateOrderRequest, CreateOrderResponse
- [x] `src/types/sse.ts` — SSEEventType, SSEEvent 유니온 타입
- [x] `src/types/api.ts` — ApiError, ApiResult

### Step 3: 서비스 레이어 생성
- [x] `src/services/api.ts` — HTTP Client (인증 헤더, 에러 처리, 토큰 갱신)
- [x] `src/services/storageService.ts` — Storage Manager (안전한 직렬화/역직렬화)
- [x] `src/services/authService.ts` — 인증 API (POST /api/table/auth)
- [x] `src/services/menuService.ts` — 메뉴 API (GET /api/menu)
- [x] `src/services/orderService.ts` — 주문 API (POST /api/orders, GET /api/orders)
- [x] `src/services/sseService.ts` — SSE Manager (연결, 재연결, 이벤트 디스패치)
- [x] `src/services/toastService.ts` — Toast Manager (큐, 자동 사라짐)

### Step 4: 서비스 레이어 단위 테스트
- [x] `src/__tests__/services/storageService.spec.ts` — localStorage 직렬화/역직렬화 + PBT
- [x] `src/__tests__/services/api.spec.ts` — HTTP Client 에러 처리, 토큰 갱신
- [x] `src/__tests__/pbt/storage.pbt.spec.ts` — fast-check 라운드트립 테스트

### Step 5: Pinia 스토어 생성
- [x] `src/stores/auth.ts` — useAuthStore (login, verifyToken, logout, loadFromStorage)
- [x] `src/stores/menu.ts` — useMenuStore (fetchMenu, getMenusByCategory)
- [x] `src/stores/cart.ts` — useCartStore (addItem, increment, decrement, remove, clear, localStorage 동기화)
- [x] `src/stores/order.ts` — useOrderStore (createOrder, fetchOrders, updateStatus, removeOrder, clearOrders)
- [x] `src/stores/sse.ts` — useSSEStore (connect, disconnect, handleEvent)

### Step 6: Pinia 스토어 단위 테스트
- [x] `src/__tests__/stores/cart.spec.ts` — 장바구니 CRUD + 금액 계산
- [x] `src/__tests__/stores/auth.spec.ts` — 인증 흐름
- [x] `src/__tests__/stores/order.spec.ts` — 주문 상태 관리
- [x] `src/__tests__/pbt/cart.pbt.spec.ts` — fast-check 금액 계산 속성, 상태 일관성
- [x] `src/__tests__/pbt/order.pbt.spec.ts` — fast-check 주문 상태 전이

### Step 7: 유틸리티 및 디렉티브 생성
- [x] `src/utils/format.ts` — 금액 포맷 (원화), 날짜 포맷
- [x] `src/utils/validation.ts` — 입력 sanitize, validate
- [x] `src/utils/animation.ts` — 애니메이션 설정, usePrefersReducedMotion
- [x] `src/directives/lazyImage.ts` — 이미지 레이지 로딩 (IntersectionObserver)

### Step 8: 라우터 및 가드 생성
- [x] `src/router/index.ts` — 라우트 정의 (레이지 로딩)
- [x] `src/router/guards.ts` — AuthGuard, GuestGuard, CartGuard, OrderResultGuard

### Step 9: 라우터 가드 단위 테스트
- [x] `src/__tests__/router/guards.spec.ts` — 가드 로직 테스트
- [ ] `src/__tests__/pbt/guards.pbt.spec.ts` — fast-check 임의 인증 상태 + 라우트 조합

### Step 10: 공통 컴포넌트 생성
- [ ] `src/components/common/LoadingSpinner.vue`
- [ ] `src/components/common/ErrorMessage.vue`
- [ ] `src/components/common/EmptyState.vue`
- [ ] `src/components/common/ConfirmDialog.vue`
- [ ] `src/components/common/ToastNotification.vue`
- [ ] `src/components/common/ErrorBoundary.vue`

### Step 11: 레이아웃 컴포넌트 생성
- [ ] `src/components/layout/AppLayout.vue` — 인증된 상태 레이아웃
- [ ] `src/components/layout/AppHeader.vue` — 상단 헤더 + 햄버거
- [ ] `src/components/layout/SideDrawer.vue` — 사이드 네비게이션
- [ ] `src/components/layout/CartBottomSheet.vue` — 장바구니 하단 시트

### Step 12: 메뉴 컴포넌트 생성
- [ ] `src/components/menu/CategoryTabs.vue` — 카테고리 탭
- [ ] `src/components/menu/MenuCard.vue` — 메뉴 카드
- [ ] `src/components/menu/MenuDetailModal.vue` — 메뉴 상세 모달

### Step 13: 장바구니/주문 컴포넌트 생성
- [ ] `src/components/cart/CartItem.vue` — 장바구니 항목
- [ ] `src/components/cart/CartSummary.vue` — 장바구니 요약
- [ ] `src/components/order/OrderCard.vue` — 주문 카드
- [ ] `src/components/order/OrderStatusBadge.vue` — 상태 배지

### Step 14: 뷰(페이지) 생성
- [ ] `src/views/SetupView.vue` — 태블릿 초기 설정 (US-1.1, US-1.5)
- [ ] `src/views/MenuView.vue` — 메뉴 조회 (US-2.1~2.5, US-3.1)
- [ ] `src/views/OrderConfirmView.vue` — 주문 확인 (US-4.1~4.2)
- [ ] `src/views/OrderSuccessView.vue` — 주문 성공 (US-4.3)
- [ ] `src/views/OrderHistoryView.vue` — 주문 내역 (US-5.1~5.4)

### Step 15: 앱 엔트리포인트 및 루트 컴포넌트
- [ ] `src/main.ts` — 앱 초기화 (Pinia, Router, Tailwind)
- [ ] `src/App.vue` — 루트 컴포넌트 (앱 초기화 로직, SSE 연결)
- [ ] `src/assets/main.css` — Tailwind 디렉티브 + 글로벌 스타일

### Step 16: 컴포넌트 단위 테스트
- [ ] `src/__tests__/components/MenuCard.spec.ts`
- [ ] `src/__tests__/components/CartItem.spec.ts`
- [ ] `src/__tests__/components/OrderStatusBadge.spec.ts`
- [ ] `src/__tests__/components/CartBottomSheet.spec.ts`

### Step 17: PBT 테스트 (API 파싱)
- [ ] `src/__tests__/pbt/api-parsing.pbt.spec.ts` — fast-check 임의 JSON 응답 안전 파싱

### Step 18: 배포 아티팩트 생성
- [ ] `frontend/customer/Dockerfile` — 멀티스테이지 빌드 (Node → Nginx)
- [ ] `frontend/customer/nginx.conf` — SPA 라우팅, gzip, 보안 헤더, API 프록시
- [ ] `frontend/customer/.dockerignore`

### Step 19: 문서 생성
- [ ] `aidlc-docs/construction/customer-app/code/code-generation-summary.md` — 생성된 파일 목록, 스토리 매핑

---

## 스토리 추적성

| Step | 구현 스토리 |
|------|------------|
| Step 2~3 | 전체 (타입/서비스 기반) |
| Step 5 (auth) | US-1.1~1.5 |
| Step 5 (menu) | US-2.1~2.5 |
| Step 5 (cart) | US-3.1~3.7 |
| Step 5 (order) | US-4.1~4.5, US-5.1~5.4 |
| Step 5 (sse) | US-5.2, US-5.4, US-9.2~9.3 |
| Step 14 (SetupView) | US-1.1, US-1.3~1.5 |
| Step 14 (MenuView) | US-2.1~2.5, US-3.1 |
| Step 14 (OrderConfirm) | US-4.1~4.2, US-4.4~4.5 |
| Step 14 (OrderSuccess) | US-4.3 |
| Step 14 (OrderHistory) | US-5.1~5.4 |
| Step 11 (CartBottomSheet) | US-3.1~3.7 |
| Step 15 (App.vue SSE) | US-9.2~9.3 |

---

## 생성 순서 근거

1. **타입 먼저** → 모든 코드의 기반
2. **서비스 레이어** → 비즈니스 로직의 핵심 (테스트 가능)
3. **스토어** → 서비스를 사용하는 상태 관리
4. **유틸리티/라우터** → 인프라 코드
5. **컴포넌트** → 공통 → 레이아웃 → 도메인별 → 뷰
6. **테스트** → 각 레이어 생성 직후 테스트 작성
7. **배포** → 마지막에 Docker/Nginx 설정
