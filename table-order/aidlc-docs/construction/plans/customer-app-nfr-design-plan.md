# Customer App - NFR Design Plan

## 계획 개요

Customer App (Unit 2)의 NFR 요구사항을 구체적 설계 패턴과 논리적 컴포넌트로 반영합니다.

---

## NFR Design 실행 계획

### Phase 1: 복원력 패턴 (Resilience)
- [x] SSE 재연결 패턴 설계 (지수 백오프, 무제한)
- [x] API 호출 에러 처리 패턴 (재시도, 폴백)
- [x] 토큰 갱신 패턴 (자동 재인증)
- [x] 에러 바운더리 패턴 (컴포넌트 격리)

### Phase 2: 성능 패턴 (Performance)
- [x] 레이지 로딩 패턴 (라우트별 코드 스플리팅)
- [x] 메모이제이션 패턴 (computed, 불필요 재렌더링 방지)
- [x] 애니메이션 성능 패턴 (GPU 가속, will-change)
- [x] 이미지 로딩 패턴 (lazy loading, placeholder)

### Phase 3: 보안 패턴 (Security)
- [x] 토큰 관리 패턴 (저장, 전송, 갱신, 삭제)
- [x] 입력 검증 패턴 (sanitize, validate)
- [x] CSP 적용 패턴

### Phase 4: 논리적 컴포넌트 (Logical Components)
- [x] HTTP 클라이언트 래퍼 (인증, 에러 처리, 재시도)
- [x] SSE 매니저 (연결, 이벤트 디스패치, 재연결)
- [x] Storage 매니저 (안전한 직렬화/역직렬화)
- [x] Toast/Notification 시스템
- [x] 애니메이션 유틸리티

---

## 질문

NFR Requirements에서 충분한 결정이 이루어졌으므로 추가 질문 없이 진행합니다.
(프론트엔드 앱 특성상 서버 측 인프라 패턴이 아닌 클라이언트 측 패턴에 집중)
