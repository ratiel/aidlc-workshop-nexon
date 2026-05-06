# Code Generation Summary — Unit 3: Admin App

## 생성 완료

### 프로젝트 설정 (7 파일)
- `package.json` — 의존성 (Vue 3, Pinia, Vue Router, Vitest, fast-check)
- `tsconfig.json` — TypeScript strict mode
- `tsconfig.node.json` — Vite 설정용
- `vite.config.ts` — Vite + Vue 플러그인 + API 프록시
- `vitest.config.ts` — Vitest + happy-dom
- `env.d.ts` — Vue SFC 타입 선언
- `index.html` — SPA 엔트리

### TypeScript 타입 (7 파일)
- `src/types/order.ts` — Order, OrderItem, OrderStatus, UpdateStatusRequest
- `src/types/table.ts` — Table, SetupTableRequest
- `src/types/auth.ts` — AdminCredentials, AuthState, LoginResponse
- `src/types/history.ts` — OrderHistory, OrderHistoryQuery, OrderHistoryResponse
- `src/types/sse.ts` — SSE 이벤트 타입 (4종)
- `src/types/api.ts` — ApiError, OrdersResponse, ConnectionStatus
- `src/types/index.ts` — 배럴 export

### 서비스 레이어 (3 파일)
- `src/services/api.ts` — HTTP 클라이언트 (fetch 래퍼, 401 인터셉터)
- `src/services/admin-api.ts` — Admin API 서비스 (7개 엔드포인트)
- `src/services/sse.ts` — SSE 서비스 (지수 백오프 재연결)

### 상태 관리 (3 파일)
- `src/stores/auth.ts` — 인증 (로그인/로그아웃/토큰 관리)
- `src/stores/orders.ts` — 주문 관리 (CRUD + SSE 핸들러 + 정렬)
- `src/stores/history.ts` — 과거 내역 (조회 + 날짜 필터)

### 뷰 (4 파일)
- `src/views/LoginView.vue` — 로그인 페이지
- `src/views/DashboardView.vue` — 대시보드 (SSE 연결)
- `src/views/TableHistoryView.vue` — 과거 내역
- `src/views/TableSetupView.vue` — 테이블 설정

### 컴포넌트 (12 파일)
- `src/components/LoginForm.vue` — 로그인 폼
- `src/components/TableGrid.vue` — 테이블 그리드
- `src/components/TableCard.vue` — 테이블 카드 (강조 + 미리보기)
- `src/components/TableFilter.vue` — 테이블 필터
- `src/components/TableDetailModal.vue` — 상세 모달
- `src/components/OrderItem.vue` — 주문 항목 (상태 변경)
- `src/components/DateFilter.vue` — 날짜 필터
- `src/components/common/AppHeader.vue` — 앱 헤더
- `src/components/common/ConfirmModal.vue` — 확인 팝업
- `src/components/common/ToastNotification.vue` — 토스트
- `src/components/common/LoadingSpinner.vue` — 로딩
- `src/components/common/ErrorMessage.vue` — 에러

### 라우터 (2 파일)
- `src/router/index.ts` — 라우트 정의
- `src/router/guards.ts` — 인증 가드

### 테스트 (10 파일)
- `src/services/__tests__/api.spec.ts` — HTTP 클라이언트 (7 테스트)
- `src/services/__tests__/admin-api.spec.ts` — API 서비스 (7 테스트)
- `src/services/__tests__/sse.spec.ts` — SSE 서비스 (8 테스트)
- `src/stores/__tests__/auth.spec.ts` — authStore (5 테스트)
- `src/stores/__tests__/orders.spec.ts` — ordersStore (9 테스트)
- `src/stores/__tests__/history.spec.ts` — historyStore (4 테스트)
- `src/__tests__/pbt/generators.ts` — 도메인 생성기
- `src/__tests__/pbt/order-status-transitions.pbt.spec.ts` — 상태 전이 PBT (5 속성)
- `src/__tests__/pbt/table-sorting.pbt.spec.ts` — 정렬 PBT (5 속성)
- `src/__tests__/pbt/total-amount-calculation.pbt.spec.ts` — 총액 PBT (7 속성)

### 배포 (2 파일)
- `Dockerfile` — Multi-stage (Node build → Nginx serve)
- `nginx.conf` — SPA 라우팅 + 보안 헤더 + SSE 프록시

### 스타일 (1 파일)
- `src/assets/styles/main.css` — 글로벌 스타일 + CSS 변수

---

## 총계
- **생성 파일**: 51개
- **테스트 파일**: 10개 (예시 기반 40+ 테스트 + PBT 17 속성)
- **스토리 커버리지**: 18/18 (100%)
