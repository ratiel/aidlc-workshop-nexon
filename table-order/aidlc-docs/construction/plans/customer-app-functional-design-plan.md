# Customer App - Functional Design Plan

## 계획 개요

Customer App (Unit 2)의 상세 비즈니스 로직을 설계합니다.
아래 질문에 답변 후, 승인하시면 Functional Design 산출물을 생성합니다.

---

## Functional Design 실행 계획

### Phase 1: 도메인 엔티티 정의
- [x] 프론트엔드 도메인 모델 정의 (Menu, CartItem, Order, Session 등)
- [x] 타입 정의 (TypeScript interfaces/types)
- [x] API 응답 타입 매핑

### Phase 2: 비즈니스 로직 모델
- [x] 장바구니 상태 관리 로직 (추가/삭제/수량변경/금액계산)
- [x] 인증 흐름 (자동 로그인, 토큰 갱신, 실패 처리)
- [x] 주문 생성 흐름 (검증 → 전송 → 성공/실패 처리)
- [x] SSE 이벤트 처리 흐름 (연결/수신/재연결/세션종료)
- [x] 라우팅 가드 로직 (인증 상태 기반 접근 제어)

### Phase 3: 비즈니스 규칙
- [x] 장바구니 검증 규칙 (빈 장바구니 주문 방지, 수량 제한 등)
- [x] 인증 규칙 (토큰 만료, localStorage 검증)
- [x] 주문 규칙 (중복 전송 방지, 세션 유효성)
- [x] UI 상태 전이 규칙

### Phase 4: 프론트엔드 컴포넌트 설계
- [x] 컴포넌트 계층 구조 정의
- [x] 각 컴포넌트의 Props/Emits/State 정의
- [x] Pinia 스토어 구조 (auth, menu, cart, order, sse)
- [x] 사용자 인터랙션 흐름
- [x] API 통합 포인트 (각 컴포넌트 ↔ Backend 엔드포인트)

---

## 명확화 질문

아래 질문에 답변해 주세요. 각 `[Answer]:` 태그 뒤에 선택한 알파벳을 입력해 주세요.

---

## Question 1: 장바구니 수량 상한

장바구니에서 단일 메뉴의 최대 수량 제한이 필요합니까?

A) 제한 없음 — 무제한 수량 허용
B) 최대 10개 — 단일 메뉴당 10개까지
C) 최대 20개 — 단일 메뉴당 20개까지
D) 최대 99개 — 단일 메뉴당 99개까지
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2: 메뉴 상세 표시 방식

메뉴 카드를 탭했을 때 상세 정보를 어떻게 표시하시겠습니까?

A) 모달/팝업 — 현재 화면 위에 오버레이로 표시
B) 별도 페이지 — 새로운 라우트(/menu/:id)로 이동
C) 하단 시트(Bottom Sheet) — 아래에서 올라오는 패널
D) 인라인 확장 — 카드가 확장되어 상세 정보 표시
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3: 주문 성공 후 리다이렉트 대상

주문 성공 후 5초 카운트다운 이후 어디로 이동하시겠습니까?

A) 메뉴 화면 (/) — 바로 새 주문 가능
B) 주문 내역 화면 (/orders) — 방금 주문한 내역 확인
C) Other (please describe after [Answer]: tag below)

[Answer]:B

---

## Question 4: SSE 재연결 최대 시도 횟수

SSE 연결이 끊겼을 때 자동 재연결 최대 시도 횟수를 어떻게 설정하시겠습니까?

A) 5회 — 5회 실패 후 수동 새로고침 안내
B) 10회 — 10회 실패 후 수동 새로고침 안내
C) 무제한 — 계속 재시도 (간격만 증가)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 5: 네비게이션 구조

Customer App의 메인 네비게이션을 어떻게 구성하시겠습니까?

A) 하단 탭 바 — 메뉴 / 장바구니 / 주문내역 (3탭)
B) 상단 헤더 + 장바구니 아이콘 — 메뉴가 기본, 장바구니/주문내역은 아이콘으로 접근
C) 사이드 드로어 — 햄버거 메뉴로 네비게이션
D) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Question 6: 장바구니 접근 방식

장바구니를 별도 페이지로 구성할지, 사이드 패널로 구성할지 선택해 주세요.

A) 별도 페이지 (/cart) — 장바구니 전용 화면
B) 사이드 패널/드로어 — 메뉴 화면에서 슬라이드로 열림
C) 하단 시트 — 메뉴 화면 아래에서 올라오는 패널
D) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Question 7: 주문 상태 표시 스타일

주문 내역에서 주문 상태(대기중/준비중/완료)를 어떻게 시각적으로 구분하시겠습니까?

A) 색상 배지 — 대기중(노란색), 준비중(파란색), 완료(초록색) 텍스트 배지
B) 아이콘 + 색상 — 상태별 아이콘과 색상 조합
C) 프로그레스 바 — 3단계 진행 표시줄
D) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Question 8: 세션 종료 시 사용자 알림

관리자가 이용 완료 처리 시 고객 화면에 어떤 알림을 표시하시겠습니까?

A) 전체 화면 모달 — "이용이 종료되었습니다" 메시지 후 자동 초기화
B) 토스트 알림 — 상단/하단에 잠시 표시 후 자동 초기화
C) 알림 없이 자동 초기화 — 조용히 메뉴 화면으로 리셋
D) Other (please describe after [Answer]: tag below)

[Answer]:C

---

모든 질문에 답변하신 후 "완료"라고 알려주세요.
