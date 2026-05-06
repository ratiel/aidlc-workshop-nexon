# Customer App - NFR Requirements Plan

## 계획 개요

Customer App (Unit 2)의 비기능 요구사항을 평가하고 기술 스택 세부 결정을 수행합니다.
아래 질문에 답변 후, 승인하시면 NFR Requirements 산출물을 생성합니다.

---

## NFR Requirements 실행 계획

### Phase 1: 성능 요구사항
- [x] 페이지 로딩 성능 기준 정의
- [x] API 호출 응답 시간 기준 정의
- [x] 렌더링 성능 기준 (FPS, 인터랙션 지연)

### Phase 2: 보안 요구사항
- [x] 토큰 저장 보안 (localStorage XSS 방어)
- [x] 입력값 검증 및 XSS 방지
- [x] CSP(Content Security Policy) 적용 범위

### Phase 3: 신뢰성 요구사항
- [x] SSE 연결 안정성 및 재연결 전략
- [x] 오프라인/네트워크 불안정 대응
- [x] 데이터 일관성 보장 (localStorage ↔ 서버)

### Phase 4: 사용성/접근성 요구사항
- [x] 터치 인터페이스 최적화
- [x] 접근성(a11y) 수준 결정
- [x] 반응형 레이아웃 범위

### Phase 5: 테스트 전략
- [x] PBT(Property-Based Testing) 적용 범위 결정
- [x] 단위 테스트 커버리지 기준
- [x] E2E 테스트 범위

### Phase 6: 기술 스택 세부 결정
- [x] CSS 프레임워크/방법론 결정
- [x] 추가 라이브러리 결정 (애니메이션, 아이콘 등)
- [x] 빌드/번들 최적화 전략

---

## 명확화 질문

아래 질문에 답변해 주세요. 각 `[Answer]:` 태그 뒤에 선택한 알파벳을 입력해 주세요.

---

## Question 1: CSS 스타일링 방법

Customer App의 CSS 스타일링 방법을 선택해 주세요.

A) Tailwind CSS — 유틸리티 퍼스트 CSS 프레임워크
B) 순수 CSS (Scoped) — Vue SFC의 `<style scoped>` 활용
C) SCSS/SASS — CSS 전처리기 사용
D) UnoCSS — Tailwind 호환 경량 엔진
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2: 아이콘 라이브러리

UI 아이콘을 어떻게 제공하시겠습니까?

A) Material Design Icons (MDI) — Google Material 아이콘
B) Heroicons — Tailwind 팀 제작 아이콘
C) Lucide Icons — Feather Icons 포크, 경량
D) 아이콘 없음 — 텍스트와 이모지만 사용
E) Other (please describe after [Answer]: tag below)

[Answer]:B

---

## Question 3: 접근성(a11y) 수준

접근성 준수 수준을 어떻게 설정하시겠습니까?

A) 기본 — ARIA 라벨, 키보드 네비게이션, 시맨틱 HTML만
B) WCAG 2.1 AA — 색상 대비, 포커스 관리, 스크린 리더 지원 포함
C) 최소 — 터치 영역(44x44px)만 보장, 나머지는 추후
D) Other (please describe after [Answer]: tag below)

[Answer]:B

---

## Question 4: 단위 테스트 커버리지 목표

Vitest 단위 테스트의 코드 커버리지 목표를 설정해 주세요.

A) 80% 이상 — 비즈니스 로직 + 컴포넌트 주요 경로
B) 60% 이상 — 비즈니스 로직 중심 (스토어, 서비스)
C) 핵심 로직만 — 장바구니 계산, 인증 흐름, SSE 처리만 테스트
D) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Question 5: PBT 적용 범위

fast-check PBT를 어디에 적용하시겠습니까?

A) 핵심 비즈니스 로직만 — 장바구니 금액 계산, 수량 변경 로직
B) 비즈니스 로직 + 상태 관리 — 위 + Pinia 스토어 상태 전이
C) 광범위 — 위 + API 응답 파싱, localStorage 직렬화/역직렬화, 라우팅 가드
D) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Question 6: 번들 크기 최적화

프로덕션 빌드 시 번들 크기 최적화 수준을 선택해 주세요.

A) 기본 Vite 최적화 — 코드 스플리팅, 트리 쉐이킹만
B) 적극적 최적화 — 위 + 라우트별 레이지 로딩, 이미지 최적화, gzip
C) 최소 관심 — 소규모 매장용이므로 번들 크기 크게 신경 안 씀
D) Other (please describe after [Answer]: tag below)

[Answer]:B

---

## Question 7: 오프라인 대응

네트워크 연결이 불안정할 때 어떻게 대응하시겠습니까?

A) 기본 에러 처리만 — 네트워크 에러 시 에러 메시지 + 재시도 버튼
B) 부분 오프라인 지원 — 장바구니는 오프라인 유지, API 호출만 에러 처리
C) Service Worker — 메뉴 데이터 캐싱, 오프라인에서도 메뉴 조회 가능
D) Other (please describe after [Answer]: tag below)

[Answer]:A, 오프라인은 지원하지 않음

---

## Question 8: 애니메이션/트랜지션

UI 애니메이션 수준을 선택해 주세요.

A) 최소 — 페이지 전환, 모달 열기/닫기만 기본 트랜지션
B) 보통 — 위 + 하단 시트 슬라이드, 드로어 슬라이드, 토스트 페이드
C) 풍부 — 위 + 장바구니 추가 애니메이션, 상태 변경 하이라이트, 마이크로 인터랙션
D) Other (please describe after [Answer]: tag below)

[Answer]:C

---

모든 질문에 답변하신 후 "완료"라고 알려주세요.
