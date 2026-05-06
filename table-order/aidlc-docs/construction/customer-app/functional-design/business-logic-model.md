# Customer App - Business Logic Model

## 1. 인증 흐름

### 1.1 앱 초기화 흐름

```
앱 시작
  │
  ├── localStorage에 auth_token 존재?
  │     │
  │     ├── YES → 서버 토큰 검증 (GET /api/table/verify 또는 메뉴 API 호출)
  │     │          │
  │     │          ├── 성공 → 메뉴 화면 (/) 이동
  │     │          └── 실패 (401) → localStorage 토큰 삭제 → 설정 화면 (/setup) 이동
  │     │
  │     └── NO → localStorage에 auth_credentials 존재?
  │               │
  │               ├── YES → 자동 로그인 시도 (POST /api/table/auth)
  │               │          │
  │               │          ├── 성공 → 토큰 저장 → 메뉴 화면 이동
  │               │          └── 실패 → credentials 삭제 → 설정 화면 이동
  │               │
  │               └── NO → 설정 화면 (/setup) 이동
```

### 1.2 초기 설정 흐름

```
설정 화면 (/setup)
  │
  ├── 입력: storeId, tableNumber, password
  │     │
  │     ├── 모든 필드 입력됨?
  │     │     ├── NO → 저장 버튼 비활성화
  │     │     └── YES → 저장 버튼 활성화
  │     │
  │     └── 저장 버튼 탭
  │           │
  │           ├── POST /api/table/auth { storeId, tableNumber, password }
  │           │
  │           ├── 성공 (200)
  │           │     ├── auth_credentials → localStorage 저장
  │           │     ├── auth_token → localStorage 저장
  │           │     └── 메뉴 화면 (/) 이동
  │           │
  │           └── 실패 (401)
  │                 ├── 에러 메시지 표시: "인증에 실패했습니다. 정보를 확인해 주세요."
  │                 └── 입력값 유지 (재시도 가능)
```

### 1.3 인증 헤더 관리

```
모든 API 요청 시:
  │
  ├── auth_token에서 token 추출
  ├── Authorization: Bearer {token} 헤더 추가
  │
  └── 응답 401 수신 시:
        ├── auth_token 삭제
        ├── 자동 로그인 재시도 (credentials 있으면)
        └── 실패 시 설정 화면 이동
```

---

## 2. 메뉴 조회 흐름

### 2.1 메뉴 로딩

```
메뉴 화면 진입
  │
  ├── GET /api/menu (전체 카테고리 + 메뉴)
  │
  ├── 성공
  │     ├── 카테고리 목록 저장 (Pinia store)
  │     ├── 첫 번째 카테고리 자동 선택
  │     └── 해당 카테고리 메뉴 표시
  │
  └── 실패
        ├── 에러 메시지: "메뉴를 불러올 수 없습니다"
        └── "다시 시도" 버튼 표시
```

### 2.2 카테고리 전환

```
카테고리 탭 탭
  │
  ├── 선택된 카테고리 ID 업데이트
  ├── 해당 카테고리 메뉴 필터링 (이미 로드된 데이터에서)
  └── 스크롤 위치 초기화
```

### 2.3 메뉴 상세 (모달)

```
메뉴 카드 탭
  │
  ├── 선택된 메뉴 정보로 모달 열기
  │     ├── 메뉴명, 가격, 설명, 이미지 표시
  │     └── "장바구니 추가" 버튼
  │
  ├── 장바구니 추가 탭 → 장바구니 로직 실행
  └── 닫기/배경 탭 → 모달 닫기
```

---

## 3. 장바구니 관리 흐름

### 3.1 장바구니 추가

```
장바구니 추가 버튼 탭 (메뉴 카드 또는 모달에서)
  │
  ├── 해당 menuId가 이미 장바구니에 있는가?
  │     ├── YES → quantity + 1
  │     └── NO → 새 CartItem 생성 (quantity: 1)
  │
  ├── totalAmount 재계산
  ├── totalQuantity 재계산
  ├── localStorage 동기화
  └── 시각적 피드백 (토스트: "장바구니에 추가되었습니다")
```

### 3.2 수량 변경

```
+ 버튼 탭:
  ├── quantity + 1 (제한 없음)
  ├── totalAmount 재계산
  └── localStorage 동기화

- 버튼 탭:
  ├── quantity > 1 → quantity - 1
  ├── quantity === 1 → 해당 항목 삭제
  ├── totalAmount 재계산
  └── localStorage 동기화
```

### 3.3 항목 삭제

```
삭제 버튼 탭:
  ├── 해당 CartItem 제거
  ├── totalAmount 재계산
  ├── totalQuantity 재계산
  ├── localStorage 동기화
  └── 장바구니 비었으면 → "장바구니가 비어있습니다" 표시
```

### 3.4 전체 비우기

```
전체 비우기 버튼 탭:
  │
  ├── 확인 팝업: "장바구니를 비우시겠습니까?"
  │     ├── 확인 → items = [], totalAmount = 0, totalQuantity = 0
  │     │          └── localStorage 동기화
  │     └── 취소 → 아무 동작 없음
```

### 3.5 금액 계산 공식

```
totalAmount = Σ (item.price × item.quantity) for all items
totalQuantity = Σ (item.quantity) for all items
```

### 3.6 localStorage 복원 (앱 시작 시)

```
앱 시작 시:
  ├── localStorage에서 cart_items 읽기
  ├── 유효한 배열이면 → CartItem[] 복원
  ├── totalAmount, totalQuantity 재계산
  └── 유효하지 않으면 → 빈 장바구니로 초기화
```

---

## 4. 주문 생성 흐름

### 4.1 주문 확인 화면 진입

```
장바구니 하단 시트에서 "주문하기" 버튼 탭
  │
  ├── 장바구니 비어있음? → 버튼 비활성화 (진입 불가)
  └── 장바구니 있음 → /order/confirm 이동
        └── 메뉴 목록, 수량, 단가, 소계, 총 금액 표시
```

### 4.2 주문 확정

```
주문 확정 버튼 탭
  │
  ├── 중복 전송 방지: isSubmitting = true, 버튼 비활성화
  │
  ├── POST /api/orders
  │     Body: { storeId, tableId, sessionId, items, totalAmount }
  │
  ├── 성공 (201)
  │     ├── 장바구니 비우기 (localStorage 포함)
  │     ├── /order/success 이동
  │     │     ├── 주문 번호 표시
  │     │     ├── "주문이 접수되었습니다" 메시지
  │     │     ├── 5초 카운트다운 표시
  │     │     └── 5초 후 /orders (주문 내역) 이동
  │     └── isSubmitting = false
  │
  └── 실패 (4xx/5xx)
        ├── 에러 메시지: "주문에 실패했습니다. 다시 시도해 주세요."
        ├── 장바구니 데이터 보존
        └── isSubmitting = false, 버튼 재활성화
```

---

## 5. 주문 내역 조회 흐름

### 5.1 주문 목록 로딩

```
주문 내역 화면 (/orders) 진입
  │
  ├── GET /api/orders (현재 세션 주문만)
  │
  ├── 성공
  │     ├── 주문 목록 시간 순 정렬 (최신 상단)
  │     └── 각 주문: 번호, 시각, 메뉴, 금액, 상태 배지
  │
  ├── 주문 없음
  │     └── "주문 내역이 없습니다" 표시
  │
  └── 실패
        ├── "주문 내역을 불러올 수 없습니다"
        └── "다시 시도" 버튼
```

### 5.2 실시간 상태 업데이트 (SSE)

```
SSE 이벤트 수신: order_status_changed
  │
  ├── orderId로 해당 주문 찾기
  ├── status 업데이트 (pending → preparing → completed)
  └── 색상 배지 업데이트:
        ├── pending: 노란색
        ├── preparing: 파란색
        └── completed: 초록색
```

---

## 6. SSE 이벤트 처리 흐름

### 6.1 SSE 연결 관리

```
인증 성공 후:
  │
  ├── EventSource 생성: GET /api/sse/customer/{tableId}
  │     (Authorization 헤더는 URL 파라미터 또는 쿠키로 전달)
  │
  ├── onopen → 연결 상태: connected, 재시도 카운터 리셋
  │
  ├── onmessage → 이벤트 타입별 분기 처리
  │     ├── order_status_changed → 주문 상태 업데이트
  │     ├── order_deleted → 주문 목록에서 제거
  │     └── session_terminated → 세션 종료 처리
  │
  └── onerror → 재연결 로직 실행
```

### 6.2 재연결 로직 (무제한, 점진적 간격)

```
연결 끊김 감지:
  │
  ├── 재연결 간격 계산: min(1000 * 2^attempt, 30000) ms
  │     (1초 → 2초 → 4초 → 8초 → 16초 → 30초 → 30초...)
  │
  ├── setTimeout으로 재연결 시도
  │     ├── 성공 → 연결 상태: connected, attempt 리셋
  │     └── 실패 → attempt++, 다시 재연결 스케줄
  │
  └── 최대 간격: 30초 (무제한 재시도)
```

### 6.3 세션 종료 처리

```
SSE 이벤트 수신: session_terminated
  │
  ├── 장바구니 비우기 (localStorage 포함)
  ├── 주문 내역 비우기
  ├── SSE 연결 종료
  ├── 메뉴 화면 (/) 으로 자동 이동
  └── (알림 없이 조용히 초기화)
```

---

## 7. 라우팅 가드 로직

### 7.1 라우트 정의

| 경로 | 화면 | 인증 필요 | 가드 |
|------|------|-----------|------|
| /setup | 초기 설정 | No | 인증됨이면 / 로 리다이렉트 |
| / | 메뉴 | Yes | 미인증이면 /setup 이동 |
| /cart | (하단 시트) | Yes | — |
| /order/confirm | 주문 확인 | Yes | 장바구니 비었으면 / 이동 |
| /order/success | 주문 성공 | Yes | 직접 접근 시 / 이동 |
| /orders | 주문 내역 | Yes | 미인증이면 /setup 이동 |

### 7.2 네비게이션 가드 로직

```
beforeEach(to, from):
  │
  ├── to.meta.requiresAuth === true?
  │     ├── YES → auth_token 존재 + 유효?
  │     │          ├── YES → 통과
  │     │          └── NO → /setup 리다이렉트
  │     └── NO → 통과
  │
  ├── to.path === '/setup' && 이미 인증됨?
  │     └── YES → / 리다이렉트
  │
  ├── to.path === '/order/confirm' && 장바구니 비어있음?
  │     └── YES → / 리다이렉트
  │
  └── to.path === '/order/success' && 주문 결과 없음?
        └── YES → / 리다이렉트
```

---

## 8. 사이드 드로어 네비게이션

### 8.1 드로어 구조

```
사이드 드로어 (왼쪽에서 슬라이드):
  │
  ├── 테이블 정보: "테이블 {tableNumber}"
  ├── ─────────────────
  ├── 메뉴 (/) — 아이콘 + 텍스트
  ├── 주문 내역 (/orders) — 아이콘 + 텍스트
  └── ─────────────────
      └── 현재 장바구니 요약: "{totalQuantity}개 · {totalAmount}원"
```

### 8.2 드로어 열기/닫기

```
열기: 햄버거 아이콘 탭 또는 왼쪽 스와이프
닫기: 배경 탭, X 버튼, 또는 오른쪽 스와이프
```

---

## 9. 하단 시트 (장바구니)

### 9.1 하단 시트 상태

```
접힌 상태 (기본):
  ├── 장바구니 요약 바: "{totalQuantity}개 · {totalAmount}원"
  └── 위로 스와이프 또는 탭으로 펼치기

펼친 상태:
  ├── 장바구니 항목 목록 (스크롤 가능)
  │     └── 각 항목: 이름, 가격, 수량 (+/-), 삭제
  ├── 전체 비우기 버튼
  ├── 총 금액 표시
  ├── "주문하기" 버튼 (장바구니 비었으면 비활성화)
  └── 아래로 스와이프 또는 핸들 탭으로 접기
```

### 9.2 장바구니 비어있을 때

```
접힌 상태: 요약 바 숨김 (또는 "장바구니가 비어있습니다")
펼친 상태: "메뉴를 추가해 주세요" 안내 문구
```
