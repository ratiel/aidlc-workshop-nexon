# Table Order Backend API 상세 문서

> Base URL: `http://localhost:8080`

---

## 인증 방식

| 유형 | Header | 토큰 만료 |
|------|--------|-----------|
| 테이블 (고객) | `Authorization: Bearer <table_token>` | 만료 없음 |
| 관리자 | `Authorization: Bearer <admin_token>` | 16시간 |

SSE 엔드포인트는 헤더 대신 **query parameter**로 토큰 전달: `?token=<token>`

---

## 공통 에러 응답 형식

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [
      {"field": "field_name", "message": "field error message"}
    ]
  }
}
```

| HTTP Status | 의미 |
|-------------|------|
| 400 | 검증 실패 / 비즈니스 규칙 위반 |
| 401 | 인증 실패 / 토큰 없음 / 만료 |
| 404 | 리소스 없음 |
| 429 | 요청 제한 초과 |
| 500 | 서버 내부 오류 |

---

## 1. 인증 API

### POST /api/table/auth

테이블 태블릿 인증 (고객용)

**Request:**
```json
{
  "table_number": 1,
  "password": "table1pass"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "table_id": 1
}
```

**Errors:**
- 401 `INVALID_CREDENTIALS` — 테이블 번호 또는 비밀번호 불일치
- 400 `VALIDATION_ERROR` — table_number <= 0 또는 password < 4자

---

### POST /api/admin/login

관리자 로그인

**Request:**
```json
{
  "username": "admin",
  "password": "admin1234"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- 401 `INVALID_CREDENTIALS` — 사용자명 또는 비밀번호 불일치
- 429 `ACCOUNT_LOCKED` — 5회 연속 실패 시 5분 잠금
- 429 `RATE_LIMIT_EXCEEDED` — 분당 10회 초과

---

## 2. 메뉴 API (테이블 토큰 필요)

### GET /api/menu

카테고리 목록 조회

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "메인",
    "sort_order": 1,
    "created_at": "2026-05-06T15:00:00Z"
  },
  {
    "id": 2,
    "name": "사이드",
    "sort_order": 2,
    "created_at": "2026-05-06T15:00:00Z"
  }
]
```

---

### GET /api/menu/{categoryId}

카테고리별 메뉴 목록 조회

**Path Parameters:**
- `categoryId` (integer, required) — 카테고리 ID

**Response 200:**
```json
[
  {
    "id": 1,
    "category_id": 1,
    "name": "불고기 정식",
    "price": 12000,
    "description": "소고기 불고기와 밥, 반찬 세트",
    "image_url": "https://via.placeholder.com/300x200?text=Bulgogi",
    "sort_order": 1,
    "created_at": "2026-05-06T15:00:00Z",
    "updated_at": "2026-05-06T15:00:00Z"
  }
]
```

**Notes:**
- `description`, `image_url`은 값이 없으면 JSON에서 생략됨 (`omitempty`)
- `price`는 원(KRW) 단위 정수

---

## 3. 주문 API (테이블 토큰 필요)

### POST /api/orders

주문 생성

**Request:**
```json
{
  "items": [
    {"menu_id": 1, "quantity": 2},
    {"menu_id": 5, "quantity": 1}
  ]
}
```

**Response 201:**
```json
{
  "id": 1,
  "table_id": 1,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "order_number": "20260506-001",
  "status": "PENDING",
  "total_amount": 29000,
  "created_at": "2026-05-06T15:10:00Z",
  "updated_at": "2026-05-06T15:10:00Z",
  "items": [
    {
      "id": 1,
      "order_id": 1,
      "menu_id": 1,
      "menu_name": "불고기 정식",
      "quantity": 2,
      "unit_price": 12000
    },
    {
      "id": 2,
      "order_id": 1,
      "menu_id": 5,
      "menu_name": "콜라",
      "quantity": 1,
      "unit_price": 5000
    }
  ]
}
```

**Errors:**
- 400 `VALIDATION_ERROR` — items 비어있음, menu_id <= 0, quantity <= 0
- 400 `SESSION_COMPLETING` — 이용 완료 처리 중 (주문 불가)
- 404 `MENU_NOT_FOUND` — 존재하지 않는 menu_id

**비즈니스 로직:**
- 첫 주문 시 자동으로 테이블 세션 시작 (session_id 발급)
- `total_amount`는 서버에서 계산 (클라이언트 값 무시)
- `unit_price`는 주문 시점 메뉴 가격 스냅샷
- 주문 생성 시 관리자 SSE로 `order_created` 이벤트 발행

---

### GET /api/orders

현재 세션 주문 목록 조회

**Response 200:**
```json
[
  {
    "id": 1,
    "table_id": 1,
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "order_number": "20260506-001",
    "status": "PREPARING",
    "total_amount": 29000,
    "created_at": "2026-05-06T15:10:00Z",
    "updated_at": "2026-05-06T15:12:00Z",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "menu_id": 1,
        "menu_name": "불고기 정식",
        "quantity": 2,
        "unit_price": 12000
      }
    ]
  }
]
```

**Notes:**
- 현재 활성 세션의 주문만 반환
- 세션이 없으면 빈 배열 `[]` 반환
- 최신 주문이 먼저 (created_at DESC)

---

## 4. 관리자 주문 API (관리자 토큰 필요)

### GET /api/admin/orders

전체 활성 세션 주문 조회 (모든 테이블)

**Response 200:**
```json
[
  {
    "id": 1,
    "table_id": 1,
    "session_id": "...",
    "order_number": "20260506-001",
    "status": "PENDING",
    "total_amount": 29000,
    "created_at": "2026-05-06T15:10:00Z",
    "updated_at": "2026-05-06T15:10:00Z",
    "items": [...]
  }
]
```

**Notes:**
- 현재 활성 세션이 있는 테이블의 주문만 반환
- 이용 완료된 과거 주문은 포함되지 않음

---

### PATCH /api/admin/orders/{id}/status

주문 상태 변경

**Path Parameters:**
- `id` (integer, required) — 주문 ID

**Request:**
```json
{
  "status": "PREPARING"
}
```

**허용 값:** `"PREPARING"` 또는 `"COMPLETED"`

**Response 200:**
```json
{
  "success": true
}
```

**Errors:**
- 400 `INVALID_STATUS_TRANSITION` — 잘못된 상태 전이 (예: COMPLETED → PREPARING)
- 400 `VALIDATION_ERROR` — status 값이 PREPARING/COMPLETED가 아님
- 404 `ORDER_NOT_FOUND` — 존재하지 않는 주문

**상태 전이 규칙:**
```
PENDING → PREPARING (허용)
PREPARING → COMPLETED (허용)
그 외 모든 전이 → 거부
```

---

### DELETE /api/admin/orders/{id}

주문 삭제 (물리 삭제)

**Path Parameters:**
- `id` (integer, required) — 주문 ID

**Response 200:**
```json
{
  "success": true
}
```

**Errors:**
- 404 `ORDER_NOT_FOUND` — 존재하지 않는 주문

**Notes:**
- 어떤 상태의 주문이든 삭제 가능
- 삭제 시 `order_deleted` SSE 이벤트 발행 (admin + 해당 테이블)

---

## 5. 테이블 관리 API (관리자 토큰 필요)

### POST /api/admin/tables

테이블 등록

**Request:**
```json
{
  "table_number": 1,
  "password": "table1pass"
}
```

**Response 201:**
```json
{
  "id": 1,
  "table_number": 1
}
```

**Errors:**
- 400 `TABLE_NUMBER_EXISTS` — 이미 존재하는 테이블 번호
- 400 `VALIDATION_ERROR` — table_number <= 0 또는 password < 4자

---

### POST /api/admin/tables/{id}/complete

테이블 이용 완료 (세션 종료)

**Path Parameters:**
- `id` (integer, required) — 테이블 ID (table_number가 아님!)

**Response 200:**
```json
{
  "success": true
}
```

**Errors:**
- 400 `NO_ACTIVE_SESSION` — 활성 세션 없음 (이미 IDLE 또는 COMPLETING)
- 404 `TABLE_NOT_FOUND` — 존재하지 않는 테이블

**비즈니스 로직:**
1. session_status → COMPLETING (이후 주문 즉시 거부)
2. current_session → NULL, session_status → IDLE
3. SSE 이벤트 발행: `session_completed` (해당 테이블), `table_session_completed` (관리자)

---

### GET /api/admin/tables/{id}/history

테이블 과거 주문 내역 조회

**Path Parameters:**
- `id` (integer, required) — 테이블 ID

**Query Parameters:**
- `date_from` (string, optional) — 시작 날짜 (YYYY-MM-DD)
- `date_to` (string, optional) — 종료 날짜 (YYYY-MM-DD)

**Response 200:**
```json
[
  {
    "id": 1,
    "table_id": 1,
    "session_id": "old-session-uuid",
    "order_number": "20260505-003",
    "status": "COMPLETED",
    "total_amount": 25000,
    "created_at": "2026-05-05T12:30:00Z",
    "updated_at": "2026-05-05T12:45:00Z",
    "items": [...]
  }
]
```

**Notes:**
- 현재 활성 세션 주문은 제외 (과거 세션만)
- 날짜 필터 미지정 시 전체 과거 내역 반환
- 최신 순 정렬 (created_at DESC)

---

## 6. SSE (Server-Sent Events)

### GET /api/sse/customer/{tableId}?token=<table_token>

고객용 실시간 이벤트 스트림

**Query Parameters:**
- `token` (string, required) — 테이블 토큰

**인증:** 토큰의 table_id와 URL의 tableId 일치 필수

**이벤트:**

| event | 발생 시점 | payload |
|-------|-----------|---------|
| `connected` | 연결 성공 | `{}` |
| `order_status_changed` | 주문 상태 변경 | `{"order_id", "order_number", "old_status", "new_status"}` |
| `order_deleted` | 주문 삭제 | `{"order_id", "order_number", "table_id"}` |
| `session_completed` | 이용 완료 | `{"table_id", "completed_at"}` |

**SSE 형식:**
```
event: order_status_changed
data: {"order_id":1,"order_number":"20260506-001","old_status":"PENDING","new_status":"PREPARING"}

```

**Heartbeat:** 30초 간격 `: ping\n\n`

---

### GET /api/sse/admin?token=<admin_token>

관리자용 실시간 이벤트 스트림

**Query Parameters:**
- `token` (string, required) — 관리자 토큰

**이벤트:**

| event | 발생 시점 | payload |
|-------|-----------|---------|
| `connected` | 연결 성공 | `{}` |
| `order_created` | 신규 주문 | `{"order_id", "table_id", "table_number", "order_number", "total_amount", "items"}` |
| `order_status_changed` | 주문 상태 변경 | `{"order_id", "order_number", "old_status", "new_status"}` |
| `order_deleted` | 주문 삭제 | `{"order_id", "order_number", "table_id"}` |
| `table_session_completed` | 이용 완료 | `{"table_id", "table_number", "completed_at"}` |

---

## 7. Rate Limiting

| 대상 | 제한 | 초과 시 |
|------|------|---------|
| 일반 API (모든 엔드포인트) | IP당 120회/분 | 429 + `Retry-After: 60` |
| 로그인 (table/auth, admin/login) | IP당 10회/분 | 429 + `Retry-After: 60` |

---

## 8. 응답 헤더

모든 응답에 포함되는 헤더:

```
X-Request-ID: <uuid>
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 9. Seed 데이터 (초기 상태)

서버 첫 실행 시 자동 생성:

**카테고리 (4개):**
| id | name | sort_order |
|----|------|------------|
| 1 | 메인 | 1 |
| 2 | 사이드 | 2 |
| 3 | 음료 | 3 |
| 4 | 디저트 | 4 |

**메뉴 (13개):**
| id | category | name | price |
|----|----------|------|-------|
| 1 | 메인 | 불고기 정식 | 12000 |
| 2 | 메인 | 김치찌개 | 9000 |
| 3 | 메인 | 비빔밥 | 10000 |
| 4 | 메인 | 된장찌개 | 8500 |
| 5 | 사이드 | 계란말이 | 5000 |
| 6 | 사이드 | 김치전 | 6000 |
| 7 | 사이드 | 떡볶이 | 5500 |
| 8 | 음료 | 콜라 | 2000 |
| 9 | 음료 | 사이다 | 2000 |
| 10 | 음료 | 맥주 | 5000 |
| 11 | 음료 | 소주 | 5000 |
| 12 | 디저트 | 아이스크림 | 3000 |
| 13 | 디저트 | 식혜 | 2500 |

**관리자 계정:** 환경변수 `ADMIN_USERNAME` / `ADMIN_PASSWORD`로 설정
