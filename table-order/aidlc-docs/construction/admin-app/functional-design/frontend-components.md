# Admin App — 프론트엔드 컴포넌트 설계

## 1. 컴포넌트 계층 구조

```
App.vue
├── router-view
│   ├── LoginView.vue
│   │   └── LoginForm.vue
│   ├── DashboardView.vue
│   │   ├── ConnectionStatus.vue
│   │   ├── TableFilter.vue
│   │   ├── TableGrid.vue
│   │   │   └── TableCard.vue (반복)
│   │   │       ├── TableCardHeader.vue
│   │   │       └── OrderPreview.vue (최대 3개)
│   │   └── TableDetailModal.vue
│   │       ├── OrderList.vue
│   │       │   └── OrderItem.vue (반복)
│   │       └── TableActions.vue
│   ├── TableHistoryView.vue
│   │   ├── DateFilter.vue
│   │   └── HistoryList.vue
│   │       └── HistoryItem.vue (반복)
│   └── TableSetupView.vue
│       └── TableSetupForm.vue
├── components/common/
│   ├── AppHeader.vue
│   ├── ConfirmModal.vue
│   ├── ToastNotification.vue
│   ├── LoadingSpinner.vue
│   └── ErrorMessage.vue
```

---

## 2. 페이지 뷰 (Views)

### LoginView.vue
| 항목 | 내용 |
|------|------|
| **경로** | /login |
| **역할** | 관리자 로그인 화면 |
| **자식 컴포넌트** | LoginForm |
| **Store 의존** | authStore |
| **인증 필요** | ❌ |

### DashboardView.vue
| 항목 | 내용 |
|------|------|
| **경로** | / |
| **역할** | 테이블별 주문 모니터링 대시보드 |
| **자식 컴포넌트** | ConnectionStatus, TableFilter, TableGrid, TableDetailModal |
| **Store 의존** | ordersStore, authStore |
| **인증 필요** | ✅ |
| **SSE 연결** | 마운트 시 연결, 언마운트 시 해제 |

### TableHistoryView.vue
| 항목 | 내용 |
|------|------|
| **경로** | /tables/:id/history |
| **역할** | 테이블 과거 주문 내역 조회 |
| **자식 컴포넌트** | DateFilter, HistoryList |
| **Store 의존** | historyStore, authStore |
| **인증 필요** | ✅ |

### TableSetupView.vue
| 항목 | 내용 |
|------|------|
| **경로** | /tables/setup |
| **역할** | 테이블 태블릿 초기 설정 |
| **자식 컴포넌트** | TableSetupForm |
| **Store 의존** | authStore |
| **인증 필요** | ✅ |

---

## 3. 핵심 컴포넌트 상세

### LoginForm.vue
```typescript
// Props: 없음
// Emits: 없음 (store 직접 호출)

// State
const storeId = ref('');
const username = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

// Methods
async function handleLogin(): Promise<void>;
function validateForm(): boolean;
```

### TableCard.vue
```typescript
// Props
interface TableCardProps {
  table: Table;
}

// Emits
interface TableCardEmits {
  (e: 'click', tableId: string): void;
}

// Computed
const latestOrders: ComputedRef<Order[]>; // 최신 3개
const statusColor: ComputedRef<string>;   // 강조 색상
const orderSummary: ComputedRef<string>;  // "외 n건" 텍스트
```

### TableDetailModal.vue
```typescript
// Props
interface TableDetailModalProps {
  table: Table;
  isOpen: boolean;
}

// Emits
interface TableDetailModalEmits {
  (e: 'close'): void;
  (e: 'status-change', orderId: string, status: OrderStatus): void;
  (e: 'delete-order', orderId: string): void;
  (e: 'complete-table'): void;
  (e: 'view-history'): void;
}
```

### OrderItem.vue
```typescript
// Props
interface OrderItemProps {
  order: Order;
}

// Emits
interface OrderItemEmits {
  (e: 'status-change', orderId: string, status: OrderStatus): void;
  (e: 'delete', orderId: string): void;
}

// Computed
const statusLabel: ComputedRef<string>;   // "대기중" | "준비중" | "완료"
const statusClass: ComputedRef<string>;   // CSS 클래스
const canAdvance: ComputedRef<boolean>;   // 다음 상태로 전이 가능 여부
const nextStatus: ComputedRef<OrderStatus | null>;
```

### ConnectionStatus.vue
```typescript
// Props: 없음 (store에서 직접 읽음)

// Computed (from ordersStore)
const status: ComputedRef<'connected' | 'reconnecting' | 'disconnected'>;
const statusIcon: ComputedRef<string>;  // 🟢 | 🟡 | 🔴
const statusText: ComputedRef<string>;  // "연결됨" | "재연결 중" | "연결 끊김"
```

### ConfirmModal.vue
```typescript
// Props
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;  // 기본: "확인"
  cancelText?: string;   // 기본: "취소"
  variant?: 'default' | 'danger'; // 삭제 시 danger
}

// Emits
interface ConfirmModalEmits {
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}
```

### DateFilter.vue
```typescript
// Props
interface DateFilterProps {
  startDate: string | null;
  endDate: string | null;
}

// Emits
interface DateFilterEmits {
  (e: 'filter', startDate: string | null, endDate: string | null): void;
  (e: 'clear'): void;
}
```

### TableFilter.vue
```typescript
// Props
interface TableFilterProps {
  tables: Table[];
  selectedTableId: string | null;
}

// Emits
interface TableFilterEmits {
  (e: 'select', tableId: string | null): void; // null = 전체
}
```

---

## 4. 화면 간 네비게이션 플로우

```
/login ──(로그인 성공)──> / (대시보드)
  ^                       |
  |                       ├──(테이블 카드 클릭)──> TableDetailModal (모달)
  |                       |                         |
  |                       |                         ├──(과거 내역)──> /tables/:id/history
  |                       |                         |                    |
  |                       |                         |                    └──(닫기)──> / (대시보드)
  |                       |                         |
  |                       |                         └──(닫기)──> / (대시보드)
  |                       |
  |                       └──(테이블 설정)──> /tables/setup
  |                                              |
  |                                              └──(완료/취소)──> / (대시보드)
  |
  └──(401 응답 / 토큰 만료)──────────────────────────┘
```

---

## 5. 사용자 인터랙션 플로우

### 주문 상태 변경 (대기중 → 준비중)
1. 대시보드에서 테이블 카드 클릭 → 모달 열림
2. 주문 목록에서 "준비중" 버튼 클릭
3. (확인 팝업 없음) → 즉시 API 호출
4. UI 낙관적 업데이트 → 상태 변경 반영
5. 성공: 유지 / 실패: 롤백 + 에러 토스트

### 주문 상태 변경 (준비중 → 완료)
1. 대시보드에서 테이블 카드 클릭 → 모달 열림
2. 주문 목록에서 "완료" 버튼 클릭
3. 확인 팝업: "주문을 완료 처리하시겠습니까?"
4. "확인" 클릭 → API 호출
5. UI 낙관적 업데이트 → 상태 변경 반영
6. 성공: 유지 / 실패: 롤백 + 에러 토스트

### 주문 삭제
1. 테이블 상세 모달에서 삭제 버튼 클릭
2. 확인 팝업: "이 주문을 삭제하시겠습니까?" (danger variant)
3. "확인" 클릭 → API 호출
4. 성공: 주문 제거, 총액 재계산 / 실패: 에러 토스트

### 테이블 이용 완료
1. 테이블 상세 모달에서 "이용 완료" 버튼 클릭
2. 확인 팝업: "테이블 이용을 완료하시겠습니까?"
3. "확인" 클릭 → API 호출
4. 성공: 테이블 카드 초기화, 모달 닫기 / 실패: 에러 토스트

---

## 6. 반응형 디자인 브레이크포인트

| 브레이크포인트 | 범위 | 레이아웃 |
|---------------|------|----------|
| 태블릿 | 768px ~ 1023px | 그리드 2열 |
| 데스크톱 | 1024px ~ 1439px | 그리드 3열 |
| 와이드 | 1440px+ | 그리드 4열 |

### 최소 지원 해상도
- 최소 너비: 768px
- 최소 높이: 600px
