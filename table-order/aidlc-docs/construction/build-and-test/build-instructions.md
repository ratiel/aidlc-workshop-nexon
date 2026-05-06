# Build Instructions — Unit 3: Admin App

## 사전 요구사항
- **Node.js**: v20.x 이상
- **npm**: v10.x 이상
- **Docker**: v24.x 이상 (배포 빌드 시)
- **디스크 공간**: 최소 500MB

## 빌드 단계

### 1. 의존성 설치
```bash
cd frontend/admin
npm install
```

### 2. 환경 설정
개발 환경에서는 별도 환경 변수 불필요 (vite.config.ts의 프록시 설정 사용).

프로덕션 빌드 시:
```bash
# Backend API URL (Nginx에서 프록시하므로 별도 설정 불필요)
```

### 3. 개발 서버 실행
```bash
npm run dev
# → http://localhost:3001 에서 접근
# → API 요청은 http://localhost:8080 으로 프록시
```

### 4. 프로덕션 빌드
```bash
npm run build
```

**빌드 산출물**: `dist/` 디렉토리
- `dist/index.html`
- `dist/assets/*.js` (번들)
- `dist/assets/*.css` (스타일)

### 5. Docker 빌드
```bash
docker build -t table-order-admin:latest .
```

### 6. Docker 실행
```bash
docker run -p 3001:3001 table-order-admin:latest
```

## 빌드 검증
- TypeScript 컴파일 에러 없음 (`vue-tsc --noEmit`)
- Vite 빌드 성공 (dist/ 생성)
- Docker 이미지 빌드 성공

## 트러블슈팅

### TypeScript 컴파일 에러
- **원인**: 타입 불일치 또는 strict mode 위반
- **해결**: `npx vue-tsc --noEmit` 실행 후 에러 메시지 확인

### Vite 빌드 실패
- **원인**: import 경로 오류 또는 모듈 미설치
- **해결**: `npm install` 재실행, import 경로 확인

### Docker 빌드 실패
- **원인**: Node.js 버전 불일치 또는 npm ci 실패
- **해결**: Dockerfile의 Node 버전 확인, package-lock.json 존재 확인
