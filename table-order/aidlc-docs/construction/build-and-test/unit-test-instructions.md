# Unit Test Execution — Unit 3: Admin App

## 테스트 실행

### 1. 전체 유닛 테스트 실행
```bash
cd frontend/admin
npm run test
```

### 2. 감시 모드 (개발 중)
```bash
npm run test:watch
```

### 3. 커버리지 포함 실행
```bash
npm run test:coverage
```

## 테스트 구성

### 서비스 테스트 (3 파일)
| 파일 | 테스트 수 | 대상 |
|------|-----------|------|
| `services/__tests__/api.spec.ts` | 7 | HTTP 클라이언트, 인증 헤더, 에러 처리 |
| `services/__tests__/admin-api.spec.ts` | 7 | API 엔드포인트 호출 |
| `services/__tests__/sse.spec.ts` | 8 | SSE 연결, 재연결, 이벤트 파싱 |

### 스토어 테스트 (3 파일)
| 파일 | 테스트 수 | 대상 |
|------|-----------|------|
| `stores/__tests__/auth.spec.ts` | 5 | 로그인, 로그아웃, 토큰 만료 |
| `stores/__tests__/orders.spec.ts` | 9 | 주문 CRUD, SSE 핸들러, 정렬 |
| `stores/__tests__/history.spec.ts` | 4 | 내역 조회, 날짜 필터 |

### PBT 테스트 (3 파일)
| 파일 | 속성 수 | 대상 |
|------|---------|------|
| `__tests__/pbt/order-status-transitions.pbt.spec.ts` | 5 | 상태 전이 규칙 |
| `__tests__/pbt/table-sorting.pbt.spec.ts` | 5 | 정렬 불변성 |
| `__tests__/pbt/total-amount-calculation.pbt.spec.ts` | 7 | 총액 계산 |

## 예상 결과
- **총 테스트**: 약 57개 (예시 기반 40 + PBT 17)
- **통과**: 57/57
- **실패**: 0
- **PBT seed**: 실패 시 콘솔에 seed 출력 (재현 가능)

## 실패 시 대응

### 예시 기반 테스트 실패
1. 실패 메시지에서 파일명과 테스트명 확인
2. 해당 소스 코드와 테스트 코드 비교
3. 수정 후 `npm run test` 재실행

### PBT 테스트 실패
1. 콘솔에서 **shrunk counterexample** 확인
2. seed 값 기록 (재현용)
3. counterexample을 예시 기반 회귀 테스트로 추가
4. 소스 코드 수정 후 재실행
