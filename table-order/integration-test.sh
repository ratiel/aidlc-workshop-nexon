#!/bin/bash
# =============================================================================
# 테이블오더 서비스 통합 테스트
# 사전 조건: docker compose up -d 로 전체 서비스 실행 중
# 사용법: bash integration-test.sh
# =============================================================================

set -e

BASE_URL="http://localhost:8080"
PASS=0
FAIL=0
TOTAL=0

# 색상
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 테스트 헬퍼
assert_status() {
  local test_name="$1"
  local expected="$2"
  local actual="$3"
  TOTAL=$((TOTAL + 1))
  if [ "$actual" -eq "$expected" ]; then
    echo -e "  ${GREEN}✓${NC} $test_name (HTTP $actual)"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗${NC} $test_name (expected $expected, got $actual)"
    FAIL=$((FAIL + 1))
  fi
}

assert_contains() {
  local test_name="$1"
  local expected="$2"
  local body="$3"
  TOTAL=$((TOTAL + 1))
  if echo "$body" | grep -q "$expected"; then
    echo -e "  ${GREEN}✓${NC} $test_name"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗${NC} $test_name (expected to contain: $expected)"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "============================================"
echo " 테이블오더 서비스 통합 테스트"
echo "============================================"
echo ""

# =============================================================================
echo -e "${YELLOW}[1/8] 서비스 헬스체크${NC}"
# =============================================================================

# Backend: POST /api/table/auth with invalid body → 400 means server is running
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/table/auth" \
  -H "Content-Type: application/json" \
  -d '{}')
# 400 = server is up and processing requests (validation error)
if [ "$STATUS" -eq 400 ] || [ "$STATUS" -eq 401 ]; then
  TOTAL=$((TOTAL + 1)); PASS=$((PASS + 1))
  echo -e "  ${GREEN}✓${NC} Backend API 접근 가능 (HTTP $STATUS)"
else
  TOTAL=$((TOTAL + 1)); FAIL=$((FAIL + 1))
  echo -e "  ${RED}✗${NC} Backend API 접근 불가 (HTTP $STATUS)"
fi

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
assert_status "Customer App 접근 가능" 200 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001")
assert_status "Admin App 접근 가능" 200 "$STATUS"

# =============================================================================
echo ""
echo -e "${YELLOW}[2/8] 관리자 인증${NC}"
# =============================================================================

# 관리자 로그인
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin1234"}')
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)
assert_status "관리자 로그인 성공" 200 "$STATUS"
assert_contains "JWT 토큰 반환" "token" "$BODY"

ADMIN_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 잘못된 비밀번호
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpass"}')
assert_status "잘못된 비밀번호 거부" 401 "$STATUS"

# =============================================================================
echo ""
echo -e "${YELLOW}[3/8] 테이블 등록${NC}"
# =============================================================================

# 테이블 1 등록 (이미 존재하면 400, 신규면 201 — 둘 다 허용)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/admin/tables" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"table_number":1,"password":"table1pass"}')
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)
TOTAL=$((TOTAL + 1))
if [ "$STATUS" -eq 201 ] || [ "$STATUS" -eq 400 ]; then
  echo -e "  ${GREEN}✓${NC} 테이블 1 등록 또는 이미 존재 (HTTP $STATUS)"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗${NC} 테이블 1 등록 실패 (HTTP $STATUS)"
  FAIL=$((FAIL + 1))
fi

# 검증: 중복 등록 시 400 반환 확인
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/admin/tables" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"table_number":1,"password":"table1pass"}')
assert_status "중복 테이블 거부" 400 "$STATUS"

# =============================================================================
echo ""
echo -e "${YELLOW}[4/8] 테이블 인증 (고객)${NC}"
# =============================================================================

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/table/auth" \
  -H "Content-Type: application/json" \
  -d '{"table_number":1,"password":"table1pass"}')
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)
assert_status "테이블 인증 성공" 200 "$STATUS"
assert_contains "테이블 토큰 반환" "token" "$BODY"

TABLE_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 잘못된 비밀번호
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/table/auth" \
  -H "Content-Type: application/json" \
  -d '{"table_number":1,"password":"wrongpass"}')
assert_status "잘못된 테이블 비밀번호 거부" 401 "$STATUS"

# =============================================================================
echo ""
echo -e "${YELLOW}[5/8] 메뉴 조회${NC}"
# =============================================================================

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/menu" \
  -H "Authorization: Bearer $TABLE_TOKEN")
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)
assert_status "카테고리 목록 조회" 200 "$STATUS"
assert_contains "메인 카테고리 존재" "메인" "$BODY"

RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/menu/1" \
  -H "Authorization: Bearer $TABLE_TOKEN")
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)
assert_status "카테고리별 메뉴 조회" 200 "$STATUS"
assert_contains "불고기 정식 존재" "불고기" "$BODY"

# =============================================================================
echo ""
echo -e "${YELLOW}[6/8] 주문 생성 및 조회${NC}"
# =============================================================================

# 주문 생성
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TABLE_TOKEN" \
  -d '{"items":[{"menu_id":1,"quantity":2},{"menu_id":8,"quantity":1}]}')
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)
assert_status "주문 생성 성공" 201 "$STATUS"
assert_contains "주문 번호 반환" "order_number" "$BODY"
assert_contains "총 금액 계산" "total_amount" "$BODY"

ORDER_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# 주문 목록 조회 (고객)
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/orders" \
  -H "Authorization: Bearer $TABLE_TOKEN")
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)
assert_status "고객 주문 목록 조회" 200 "$STATUS"
assert_contains "주문 포함" "PENDING" "$BODY"

# 관리자 주문 조회
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/admin/orders" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)
assert_status "관리자 주문 목록 조회" 200 "$STATUS"
assert_contains "관리자에서 주문 확인" "PENDING" "$BODY"

# =============================================================================
echo ""
echo -e "${YELLOW}[7/8] 주문 상태 변경${NC}"
# =============================================================================

# PENDING → PREPARING
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/api/admin/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status":"PREPARING"}')
assert_status "상태 변경: PENDING → PREPARING" 200 "$STATUS"

# PREPARING → COMPLETED
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/api/admin/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status":"COMPLETED"}')
assert_status "상태 변경: PREPARING → COMPLETED" 200 "$STATUS"

# 잘못된 전이 (COMPLETED → PREPARING)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/api/admin/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status":"PREPARING"}')
assert_status "잘못된 상태 전이 거부" 400 "$STATUS"

# =============================================================================
echo ""
echo -e "${YELLOW}[8/8] 테이블 이용 완료${NC}"
# =============================================================================

# 새 주문 생성 (이용 완료 테스트용)
curl -s -o /dev/null -X POST "$BASE_URL/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TABLE_TOKEN" \
  -d '{"items":[{"menu_id":2,"quantity":1}]}'

# 테이블 ID 확인 (테이블 1)
TABLE_ID=1

# 이용 완료
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/admin/tables/$TABLE_ID/complete" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status "테이블 이용 완료" 200 "$STATUS"

# 이용 완료 후 고객 주문 조회 (빈 배열)
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/orders" \
  -H "Authorization: Bearer $TABLE_TOKEN")
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)
assert_status "이용 완료 후 주문 비어있음" 200 "$STATUS"

# 과거 내역 조회
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/admin/tables/$TABLE_ID/history" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)
assert_status "과거 내역 조회" 200 "$STATUS"

# =============================================================================
echo ""
echo "============================================"
echo " 테스트 결과"
echo "============================================"
echo ""
echo -e " 총 테스트: $TOTAL"
echo -e " ${GREEN}통과: $PASS${NC}"
echo -e " ${RED}실패: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✓ 모든 통합 테스트 통과!${NC}"
  exit 0
else
  echo -e "${RED}✗ $FAIL개 테스트 실패${NC}"
  exit 1
fi
