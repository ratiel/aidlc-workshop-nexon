# Functional Design Plan — Unit 3: Admin App

## 계획 개요

Admin App의 상세 기능 설계를 위한 계획입니다.
아래 질문에 답변 후, 승인하시면 설계 문서를 생성합니다.

---

## 설계 실행 계획

### Phase 1: 비즈니스 로직 모델
- [x] 주문 상태 전이 로직 (프론트엔드 관점)
- [x] 테이블 세션 라이프사이클 관리 로직
- [x] SSE 이벤트 수신 및 상태 동기화 로직
- [x] JWT 인증 플로우 (로그인/로그아웃/만료)

### Phase 2: 도메인 엔티티
- [x] 프론트엔드 데이터 모델 (TypeScript 인터페이스)
- [x] Pinia Store 구조 설계
- [x] API 응답 타입 정의

### Phase 3: 프론트엔드 컴포넌트
- [x] 컴포넌트 계층 구조 설계
- [x] 각 컴포넌트의 Props/State 정의
- [x] 화면 간 네비게이션 플로우
- [x] 사용자 인터랙션 플로우

### Phase 4: 비즈니스 규칙
- [x] 입력값 검증 규칙
- [x] 에러 핸들링 규칙
- [x] 인증/인가 규칙 (라우트 가드)

---

## 명확화 질문

아래 질문에 답변해 주세요.

---

## Question 1
관리자 대시보드의 테이블 카드 레이아웃에서, 최신 주문 미리보기는 몇 개까지 표시하시겠습니까?

A) 최신 2개
B) 최신 3개
C) 최신 5개
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 2
주문 상태 변경 시 확인 팝업을 표시하시겠습니까?

A) Yes — 모든 상태 변경에 확인 팝업 (대기중→준비중, 준비중→완료)
B) No — 확인 없이 즉시 변경 (빠른 조작 우선)
C) 부분적 — "완료" 변경에만 확인 팝업 (되돌리기 어려우므로)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 3
대시보드에서 신규 주문 강조 표시의 지속 시간은 어느 정도가 적절한가요?

A) 5초 후 자동 해제
B) 10초 후 자동 해제
C) 관리자가 확인(클릭)할 때까지 유지
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 4
테이블 카드의 정렬 순서는 어떻게 하시겠습니까?

A) 테이블 번호 순 (1, 2, 3, ...)
B) 최신 주문 시간 순 (가장 최근 주문이 있는 테이블이 먼저)
C) 주문 금액 순 (높은 금액 먼저)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 5
관리자 화면의 반응형 디자인은 어느 수준까지 지원하시겠습니까?

A) 데스크톱 전용 (최소 1024px)
B) 태블릿 + 데스크톱 (최소 768px)
C) 모바일 포함 전체 반응형
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

모든 질문에 답변하신 후 "완료"라고 알려주세요.
