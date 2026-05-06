# Code Generation Plan — Unit 3: Admin App

## 유닛 컨텍스트

| 항목 | 내용 |
|------|------|
| **유닛** | Unit 3: Admin App |
| **기술 스택** | Vue.js 3 + TypeScript + Vite + Pinia |
| **코드 위치** | `frontend/admin/` |
| **스토리** | US-1.1, US-6.1~6.4, US-7.1~7.7, US-8.1~8.7, US-9.1 |
| **의존성** | Unit 1 (Backend API) — HTTP/SSE 통신 |

---

## 코드 생성 단계

### Step 1: 프로젝트 구조 초기화
- [x] Vue.js 3 + TypeScript + Vite 프로젝트 생성
- [x] Pinia, Vue Router 설치 및 설정
- [x] Vitest + fast-check 테스트 환경 설정
- [x] 디렉토리 구조 생성 (components, views, stores, services, types, router, utils)
- [x] tsconfig.json (strict mode)
- [x] vite.config.ts (프록시 설정 포함)

### Step 2: TypeScript 타입 정의
- [x] `src/types/order.ts` — Order, OrderItem, OrderStatus 인터페이스
- [x] `src/types/table.ts` — Table 인터페이스
- [x] `src/types/auth.ts` — AdminCredentials, AuthState, LoginResponse 인터페이스
- [x] `src/types/history.ts` — OrderHistory, OrderHistoryQuery, OrderHistoryResponse 인터페이스
- [x] `src/types/sse.ts` — SSE 이벤트 타입 (SSEEvent, SSENewOrderEvent 등)
- [x] `src/types/api.ts` — ApiError, 요청 바디 타입 (UpdateStatusRequest, SetupTableRequest)

### Step 3: API 서비스 레이어
- [x] `src/services/api.ts` — HTTP 클라이언트 (fetch 래퍼, 인증 헤더, 에러 인터셉터)
- [x] `src/services/admin-api.ts` — AdminApiService 구현 (로그인, 주문 관리, 테이블 관리)
- [x] `src/services/sse.ts` — SSE 서비스 (연결, 재연결, 이벤트 핸들링)

### Step 4: API 서비스 유닛 테스트
- [x] `src/services/__tests__/api.spec.ts` — HTTP 클라이언트 테스트
- [x] `src/services/__tests__/admin-api.spec.ts` — API 서비스 테스트
- [x] `src/services/__tests__/sse.spec.ts` — SSE 서비스 테스트

### Step 5: Pinia Stores
- [x] `src/stores/auth.ts` — authStore (로그인, 로그아웃, 토큰 관리)
- [x] `src/stores/orders.ts` — ordersStore (주문 관리, SSE 핸들러, 테이블 정렬)
- [x] `src/stores/history.ts` — historyStore (과거 내역 조회, 날짜 필터)

### Step 6: Pinia Stores 유닛 테스트 + PBT
- [x] `src/stores/__tests__/auth.spec.ts` — authStore 테스트
- [x] `src/stores/__tests__/orders.spec.ts` — ordersStore 테스트 (상태 전이, 정렬)
- [x] `src/stores/__tests__/orders.pbt.spec.ts` — ordersStore PBT (상태 전이 불변성, 정렬 속성)
- [x] `src/stores/__tests__/history.spec.ts` — historyStore 테스트

### Step 7: 공통 컴포넌트
- [x] `src/components/common/AppHeader.vue` — 앱 헤더 (로그아웃 버튼, 연결 상태)
- [x] `src/components/common/ConfirmModal.vue` — 확인 팝업 (재사용)
- [x] `src/components/common/ToastNotification.vue` — 토스트 알림
- [x] `src/components/common/LoadingSpinner.vue` — 로딩 스피너
- [x] `src/components/common/ErrorMessage.vue` — 에러 메시지

### Step 8: 로그인 화면
- [x] `src/views/LoginView.vue` — 로그인 페이지
- [x] `src/components/LoginForm.vue` — 로그인 폼 (검증 포함)
- [x] 스토리 커버: US-6.1, US-6.4

### Step 9: 대시보드 화면
- [x] `src/views/DashboardView.vue` — 대시보드 (SSE 연결 관리)
- [x] `src/components/ConnectionStatus.vue` — 연결 상태 표시
- [x] `src/components/TableFilter.vue` — 테이블 필터
- [x] `src/components/TableGrid.vue` — 테이블 그리드 레이아웃
- [x] `src/components/TableCard.vue` — 테이블 카드 (강조, 미리보기)
- [x] `src/components/TableCardHeader.vue` — 카드 헤더 (테이블 번호, 총액)
- [x] `src/components/OrderPreview.vue` — 주문 미리보기 (최신 3개)
- [x] 스토리 커버: US-7.1, US-7.2, US-7.6, US-7.7

### Step 10: 테이블 상세 모달
- [x] `src/components/TableDetailModal.vue` — 테이블 상세 모달
- [x] `src/components/OrderList.vue` — 주문 목록
- [x] `src/components/OrderItem.vue` — 주문 항목 (상태 변경 버튼)
- [x] `src/components/TableActions.vue` — 테이블 액션 (이용 완료, 과거 내역)
- [x] 스토리 커버: US-7.3, US-7.4, US-7.5, US-8.2, US-8.3, US-8.4, US-8.5

### Step 11: 과거 내역 화면
- [x] `src/views/TableHistoryView.vue` — 과거 주문 내역 페이지
- [x] `src/components/DateFilter.vue` — 날짜 필터
- [x] `src/components/HistoryList.vue` — 내역 목록
- [x] `src/components/HistoryItem.vue` — 내역 항목
- [x] 스토리 커버: US-8.6, US-8.7

### Step 12: 테이블 설정 화면
- [x] `src/views/TableSetupView.vue` — 테이블 설정 페이지
- [x] `src/components/TableSetupForm.vue` — 설정 폼 (검증 포함)
- [x] 스토리 커버: US-1.1, US-8.1

### Step 13: 라우터 및 가드
- [x] `src/router/index.ts` — Vue Router 설정 (라우트 정의)
- [x] `src/router/guards.ts` — 인증 가드 (beforeEach)
- [x] 스토리 커버: US-6.2, US-6.3

### Step 14: 앱 엔트리포인트
- [x] `src/App.vue` — 루트 컴포넌트
- [x] `src/main.ts` — 앱 초기화 (Pinia, Router 등록)

### Step 15: 컴포넌트 유닛 테스트
- [x] `src/components/__tests__/LoginForm.spec.ts`
- [x] `src/components/__tests__/TableCard.spec.ts`
- [x] `src/components/__tests__/OrderItem.spec.ts`
- [x] `src/components/__tests__/ConfirmModal.spec.ts`
- [x] `src/components/__tests__/TableDetailModal.spec.ts`

### Step 16: PBT 테스트 (속성 기반)
- [x] `src/__tests__/pbt/order-status-transitions.pbt.spec.ts` — 주문 상태 전이 속성
- [x] `src/__tests__/pbt/table-sorting.pbt.spec.ts` — 테이블 정렬 불변성
- [x] `src/__tests__/pbt/total-amount-calculation.pbt.spec.ts` — 총액 계산 불변성
- [x] `src/__tests__/pbt/generators.ts` — 도메인 생성기 (Order, Table, OrderItem)

### Step 17: 스타일 및 레이아웃
- [x] `src/assets/styles/main.css` — 글로벌 스타일
- [x] `src/assets/styles/variables.css` — CSS 변수 (색상, 간격, 브레이크포인트)
- [x] 반응형 레이아웃 (768px+)

### Step 18: 배포 아티팩트
- [x] `Dockerfile` — Nginx 기반 정적 파일 서빙
- [x] `nginx.conf` — Nginx 설정 (SPA 라우팅, 보안 헤더)
- [x] `package.json` — 의존성 및 스크립트 정의

### Step 19: 문서화
- [x] `aidlc-docs/construction/admin-app/code/code-summary.md` — 코드 생성 요약

---

## 스토리 트레이서빌리티

| 스토리 | 구현 Step | 파일 |
|--------|-----------|------|
| US-1.1 | Step 12 | TableSetupView, TableSetupForm |
| US-6.1 | Step 8 | LoginView, LoginForm |
| US-6.2 | Step 13 | router/guards.ts |
| US-6.3 | Step 13 | router/guards.ts |
| US-6.4 | Step 8 | LoginForm |
| US-7.1 | Step 9 | DashboardView, TableGrid, TableCard |
| US-7.2 | Step 9 | DashboardView (SSE), TableCard |
| US-7.3 | Step 10 | TableDetailModal, OrderList |
| US-7.4 | Step 10 | OrderItem |
| US-7.5 | Step 10 | OrderItem |
| US-7.6 | Step 9 | TableFilter |
| US-7.7 | Step 9 | DashboardView (SSE reconnect) |
| US-8.1 | Step 12 | TableSetupView, TableSetupForm |
| US-8.2 | Step 10 | OrderItem, TableDetailModal |
| US-8.3 | Step 10 | ConfirmModal, TableDetailModal |
| US-8.4 | Step 10 | TableActions, ConfirmModal |
| US-8.5 | Step 10 | TableActions |
| US-8.6 | Step 11 | TableHistoryView, HistoryList |
| US-8.7 | Step 11 | DateFilter |
| US-9.1 | Step 5 | ordersStore (SSE handler) |
