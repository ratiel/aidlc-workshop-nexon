# Integration Test Instructions — Unit 3: Admin App

## 목적
Admin App과 Backend API 간의 통합을 검증합니다.

## 사전 조건
- Unit 1 (Backend API)가 실행 중이어야 함
- SQLite DB에 Seed 데이터가 로드되어 있어야 함
- 관리자 계정이 생성되어 있어야 함

## 통합 테스트 환경 설정

### 1. Docker Compose로 전체 서비스 시작
```bash
# 프로젝트 루트에서
docker-compose up -d
```

### 2. 서비스 상태 확인
```bash
# Backend API 헬스체크
curl http://localhost:8080/api/health

# Admin App 접근 확인
curl http://localhost:3001
```

## 통합 테스트 시나리오

### Scenario 1: 관리자 로그인 → 대시보드 접근
- **설명**: 로그인 후 JWT 토큰으로 주문 데이터 조회
- **단계**:
  1. POST /api/admin/login → JWT 토큰 수신
  2. GET /api/admin/orders (Authorization 헤더) → 주문 목록 수신
- **예상 결과**: 200 OK, 주문 목록 반환

### Scenario 2: SSE 실시간 주문 수신
- **설명**: 고객 주문 생성 시 관리자 SSE로 실시간 수신
- **단계**:
  1. Admin App에서 SSE 연결 (GET /api/sse/admin)
  2. Customer App에서 주문 생성 (POST /api/orders)
  3. Admin SSE에서 new_order 이벤트 수신 확인
- **예상 결과**: 2초 이내 new_order 이벤트 수신

### Scenario 3: 주문 상태 변경 → 고객 화면 반영
- **설명**: 관리자가 상태 변경 시 고객 SSE로 전달
- **단계**:
  1. PATCH /api/admin/orders/:id/status → PREPARING
  2. Customer SSE에서 order_status_changed 이벤트 수신
- **예상 결과**: 고객 화면에 상태 변경 반영

### Scenario 4: 테이블 이용 완료 → 고객 화면 초기화
- **설명**: 이용 완료 시 고객 세션 종료
- **단계**:
  1. POST /api/admin/tables/:id/complete
  2. Customer SSE에서 table_completed 이벤트 수신
  3. 고객 화면 주문 내역 비워짐
- **예상 결과**: 고객 화면 초기화, 과거 내역으로 이동

### Scenario 5: 토큰 만료 → 자동 로그아웃
- **설명**: 16시간 후 토큰 만료 시 로그인 화면 이동
- **단계**:
  1. 만료된 토큰으로 API 호출
  2. 401 응답 수신
  3. 로그인 화면으로 리다이렉트
- **예상 결과**: localStorage 토큰 삭제, /login 이동

## 수동 통합 테스트 체크리스트

- [ ] 로그인 성공 → 대시보드 표시
- [ ] 로그인 실패 → 에러 메시지 표시
- [ ] 대시보드에서 테이블 카드 표시
- [ ] 신규 주문 시 카드 강조 + 실시간 업데이트
- [ ] 주문 상태 변경 (대기중 → 준비중 → 완료)
- [ ] 주문 삭제 → 총액 재계산
- [ ] 이용 완료 → 테이블 초기화
- [ ] 과거 내역 조회 + 날짜 필터
- [ ] SSE 연결 끊김 → 자동 재연결
- [ ] 브라우저 새로고침 → 세션 유지

## 정리
```bash
docker-compose down
```
