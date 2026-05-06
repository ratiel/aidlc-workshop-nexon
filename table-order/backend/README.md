# Table Order Backend API

Go 기반 REST API + SSE 서버 (테이블오더 서비스)

## 기술 스택

- Go 1.22+
- SQLite (mattn/go-sqlite3, CGO)
- JWT (golang-jwt/jwt/v5)
- bcrypt (golang.org/x/crypto)

## 빌드 및 실행

### 사전 요구사항

- Go 1.22+
- GCC (CGO 필요)

### 환경변수

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| JWT_SECRET | Yes | - | JWT 서명 키 (최소 32자) |
| ADMIN_PASSWORD | Yes | - | 초기 관리자 비밀번호 |
| ADMIN_USERNAME | No | admin | 관리자 사용자명 |
| PORT | No | 8080 | 서버 포트 |
| DB_PATH | No | ./data/tableorder.db | SQLite DB 경로 |
| CORS_ORIGINS | No | localhost:3000,3001 | 허용 CORS 오리진 |

### 로컬 실행

```bash
export JWT_SECRET="your-secret-key-at-least-32-characters"
export ADMIN_PASSWORD="admin1234"
cd backend
go run ./cmd/server
```

### Docker 실행

```bash
docker compose up --build
```

### 테스트

```bash
cd backend
go test ./...
```

## API 엔드포인트

### Public
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/table/auth | 테이블 인증 |
| POST | /api/admin/login | 관리자 로그인 |

### Customer (Table Token)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/menu | 카테고리 목록 |
| GET | /api/menu/:categoryId | 카테고리별 메뉴 |
| POST | /api/orders | 주문 생성 |
| GET | /api/orders | 현재 세션 주문 조회 |
| GET | /api/sse/customer/:tableId | SSE 스트림 |

### Admin (JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/orders | 전체 주문 조회 |
| PATCH | /api/admin/orders/:id/status | 주문 상태 변경 |
| DELETE | /api/admin/orders/:id | 주문 삭제 |
| POST | /api/admin/tables | 테이블 등록 |
| POST | /api/admin/tables/:id/complete | 이용 완료 |
| GET | /api/admin/tables/:id/history | 과거 내역 |
| GET | /api/sse/admin | SSE 스트림 |
