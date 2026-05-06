# Customer App - Tech Stack Decisions

## 핵심 기술 스택

| 영역 | 선택 | 버전 | 근거 |
|------|------|------|------|
| 프레임워크 | Vue.js 3 | ^3.4 | Composition API, 성능, 생태계 |
| 언어 | TypeScript | ^5.4 | 타입 안전성, IDE 지원 |
| 빌드 도구 | Vite | ^5.x | 빠른 HMR, 최적화된 빌드 |
| 상태 관리 | Pinia | ^2.x | Vue 3 공식 상태 관리, TypeScript 친화적 |
| 라우터 | Vue Router | ^4.x | Vue 3 공식 라우터 |
| CSS | Tailwind CSS | ^3.4 | 유틸리티 퍼스트, 빠른 UI 개발, 번들 최적화 |
| 아이콘 | Heroicons | ^2.x | Tailwind 팀 제작, SVG 기반, 경량 |
| 테스트 | Vitest | ^1.x | Vite 네이티브, 빠른 실행 |
| PBT | fast-check | ^3.x | TypeScript 지원, 풍부한 Arbitrary |
| 컴포넌트 테스트 | @vue/test-utils | ^2.x | Vue 공식 테스트 유틸리티 |

---

## 개발 의존성

| 패키지 | 용도 | 비고 |
|--------|------|------|
| `@vitejs/plugin-vue` | Vite Vue 플러그인 | SFC 지원 |
| `autoprefixer` | CSS 벤더 프리픽스 | Tailwind 필수 |
| `postcss` | CSS 후처리 | Tailwind 필수 |
| `tailwindcss` | CSS 프레임워크 | 유틸리티 클래스 |
| `typescript` | 타입 체크 | 빌드 타임 검증 |
| `vitest` | 단위 테스트 | Vite 통합 |
| `@vue/test-utils` | 컴포넌트 테스트 | Vue 공식 |
| `fast-check` | PBT | 속성 기반 테스트 |
| `jsdom` | DOM 환경 | 테스트용 |
| `@heroicons/vue` | 아이콘 컴포넌트 | SVG 아이콘 |

---

## 프로덕션 의존성

| 패키지 | 용도 | 비고 |
|--------|------|------|
| `vue` | UI 프레임워크 | 핵심 |
| `vue-router` | 라우팅 | SPA 네비게이션 |
| `pinia` | 상태 관리 | 반응형 스토어 |

---

## 빌드 설정

### Vite 설정 (vite.config.ts)

```typescript
// 주요 설정 항목
{
  plugins: [vue()],
  resolve: {
    alias: { '@': '/src' }
  },
  build: {
    target: 'es2020',
    sourcemap: false,        // 프로덕션 소스맵 제외
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    }
  }
}
```

### Tailwind 설정 (tailwind.config.js)

```javascript
// 주요 설정 항목
{
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 주문 상태 색상
        'status-pending': '#FFC107',
        'status-preparing': '#2196F3',
        'status-completed': '#4CAF50',
      },
      minWidth: {
        'touch': '44px',    // 최소 터치 영역
      },
      minHeight: {
        'touch': '44px',    // 최소 터치 영역
      }
    }
  }
}
```

### TypeScript 설정 (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

---

## 라우트별 레이지 로딩 전략

```typescript
// router/index.ts
const routes = [
  { path: '/setup', component: () => import('@/views/SetupView.vue') },
  { path: '/', component: () => import('@/views/MenuView.vue') },
  { path: '/order/confirm', component: () => import('@/views/OrderConfirmView.vue') },
  { path: '/order/success', component: () => import('@/views/OrderSuccessView.vue') },
  { path: '/orders', component: () => import('@/views/OrderHistoryView.vue') },
]
```

---

## 테스트 설정

### Vitest 설정 (vitest.config.ts)

```typescript
{
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      },
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/*.d.ts', 'src/main.ts']
    }
  }
}
```

### PBT 적용 대상 (fast-check)

| 파일/모듈 | PBT 테스트 내용 |
|-----------|----------------|
| `stores/cart.ts` | 임의 수량/가격에 대한 금액 계산 정확성 |
| `stores/cart.ts` | 임의 액션 시퀀스 후 상태 일관성 |
| `stores/auth.ts` | 임의 인증 상태 전이 유효성 |
| `stores/order.ts` | 임의 주문 상태 전이 유효성 |
| `services/api.ts` | 임의 JSON 응답에 대한 안전한 파싱 |
| `utils/storage.ts` | 임의 데이터 직렬화/역직렬화 라운드트립 |
| `router/guards.ts` | 임의 인증 상태 + 라우트 조합 가드 검증 |

---

## Docker 배포 설정

### Dockerfile (frontend/customer/Dockerfile)

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
```

### Nginx 설정 (nginx.conf)

```nginx
server {
    listen 3000;
    root /usr/share/nginx/html;
    index index.html;

    # gzip 압축
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;

    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; connect-src 'self'";

    # SPA 라우팅
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 프록시 (개발 환경에서는 Vite proxy, 프로덕션에서는 docker-compose 네트워크)
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;          # SSE 지원
        proxy_cache off;
    }
}
```

---

## 환경 변수

| 변수 | 용도 | 기본값 |
|------|------|--------|
| `VITE_API_BASE_URL` | Backend API 기본 URL | `/api` (Nginx 프록시) |

---

## 선택하지 않은 대안 및 근거

| 대안 | 미선택 이유 |
|------|-------------|
| 순수 CSS / SCSS | Tailwind가 빠른 UI 개발과 일관된 디자인 시스템 제공 |
| Material Design Icons | Heroicons가 Tailwind 생태계와 더 잘 통합 |
| Service Worker | 소규모 매장 Wi-Fi 환경, 오프라인 시나리오 불필요 |
| 기본 Vite 최적화만 | 태블릿 환경에서 적극적 최적화가 UX 향상에 기여 |
| PBT 핵심만 | 광범위 적용으로 더 높은 코드 신뢰성 확보 |
