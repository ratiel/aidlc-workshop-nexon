# Customer App - NFR Design Patterns

## 1. 복원력 패턴 (Resilience Patterns)

### 1.1 SSE 재연결 패턴 (Exponential Backoff with Jitter)

```typescript
// 패턴: 지수 백오프 + 지터 (무제한 재시도)
class SSEReconnector {
  private attempt = 0
  private readonly baseDelay = 1000    // 1초
  private readonly maxDelay = 30000    // 30초
  private readonly jitterFactor = 0.1  // ±10% 지터

  getNextDelay(): number {
    const exponentialDelay = Math.min(
      this.baseDelay * Math.pow(2, this.attempt),
      this.maxDelay
    )
    const jitter = exponentialDelay * this.jitterFactor * (Math.random() * 2 - 1)
    this.attempt++
    return Math.max(0, exponentialDelay + jitter)
  }

  reset(): void {
    this.attempt = 0
  }
}
```

**적용 위치**: `services/sseService.ts`
**트리거**: SSE `onerror` 이벤트 또는 연결 종료 감지
**종료 조건**: 없음 (무제한 재시도, 세션 종료 시에만 중단)

---

### 1.2 API 에러 처리 패턴 (Error Handler Chain)

```typescript
// 패턴: 계층적 에러 처리
async function apiRequest<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, withAuth(options))

    // Layer 1: HTTP 상태 코드 처리
    if (response.status === 401) {
      return await handleUnauthorized<T>(url, options)  // 토큰 갱신 시도
    }
    if (!response.ok) {
      return { success: false, error: parseApiError(response) }
    }

    // Layer 2: 응답 파싱
    const data = await safeJsonParse<T>(response)
    return { success: true, data }

  } catch (error) {
    // Layer 3: 네트워크 에러
    return { success: false, error: { code: 'NETWORK_ERROR', message: '네트워크 연결을 확인해 주세요.' } }
  }
}
```

**적용 위치**: `services/api.ts`
**에러 계층**:
1. HTTP 401 → 토큰 갱신 → 재시도 (1회)
2. HTTP 4xx/5xx → 사용자 친화적 에러 메시지
3. 네트워크 에러 → "네트워크 연결을 확인해 주세요."

---

### 1.3 토큰 자동 갱신 패턴 (Silent Refresh)

```typescript
// 패턴: 401 수신 시 자동 재인증
async function handleUnauthorized<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
  // 1. 기존 토큰 삭제
  authStore.clearToken()

  // 2. credentials로 재인증 시도
  const credentials = storageManager.get<AuthCredentials>('auth_credentials')
  if (!credentials) {
    authStore.logout()
    router.push('/setup')
    return { success: false, error: { code: 'AUTH_EXPIRED', message: '인증 정보가 만료되었습니다.' } }
  }

  // 3. 재인증
  const loginResult = await authService.login(credentials)
  if (!loginResult.success) {
    authStore.logout()
    router.push('/setup')
    return { success: false, error: loginResult.error }
  }

  // 4. 원래 요청 재시도 (1회만)
  return await apiRequest<T>(url, options)
}
```

**적용 위치**: `services/api.ts` (apiRequest 내부)
**제한**: 재인증 재시도 1회만 (무한 루프 방지)

---

### 1.4 에러 바운더리 패턴 (Component Error Isolation)

```typescript
// 패턴: Vue onErrorCaptured를 활용한 에러 격리
// ErrorBoundary.vue
{
  setup(props, { slots }) {
    const hasError = ref(false)
    const errorMessage = ref('')

    onErrorCaptured((error) => {
      hasError.value = true
      errorMessage.value = '일시적 오류가 발생했습니다.'
      console.error('[ErrorBoundary]', error)
      return false  // 에러 전파 중단
    })

    return () => hasError.value
      ? h(ErrorFallback, { message: errorMessage.value, onRetry: () => { hasError.value = false } })
      : slots.default?.()
  }
}
```

**적용 위치**: 주요 뷰 컴포넌트 래핑
**격리 범위**: 각 뷰(페이지) 단위로 에러 격리

---

## 2. 성능 패턴 (Performance Patterns)

### 2.1 라우트별 레이지 로딩 (Route-Level Code Splitting)

```typescript
// 패턴: dynamic import로 라우트별 청크 분리
const routes = [
  {
    path: '/setup',
    component: () => import('@/views/SetupView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/views/MenuView.vue'),
    meta: { requiresAuth: true }
  },
  // ... 각 라우트별 별도 청크
]
```

**효과**: 초기 로딩 시 필요한 코드만 다운로드
**청크 전략**:
- `vendor` 청크: vue, vue-router, pinia (캐시 효율)
- 라우트별 청크: 각 뷰 + 해당 뷰 전용 컴포넌트

---

### 2.2 Computed 메모이제이션 (Reactive Memoization)

```typescript
// 패턴: Pinia getter로 파생 상태 메모이제이션
// stores/cart.ts
getters: {
  totalAmount: (state) => {
    return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },
  totalQuantity: (state) => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0)
  },
  menusByCategory: (state) => {
    return (categoryId: number) =>
      state.menuItems.filter(item => item.categoryId === categoryId)
  }
}
```

**적용 위치**: 모든 Pinia 스토어의 파생 상태
**원칙**: 원본 데이터 변경 시에만 재계산

---

### 2.3 애니메이션 성능 패턴 (GPU-Accelerated Animations)

```css
/* 패턴: transform/opacity만 사용하여 GPU 가속 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1),
              opacity 250ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

.slide-enter-from { transform: translateY(100%); opacity: 0; }
.slide-leave-to { transform: translateY(100%); opacity: 0; }

/* prefers-reduced-motion 존중 */
@media (prefers-reduced-motion: reduce) {
  .slide-enter-active,
  .slide-leave-active {
    transition: none;
  }
}
```

**원칙**:
- `transform`, `opacity`만 애니메이션 (레이아웃 트리거 회피)
- `will-change` 힌트 (애니메이션 시작 전)
- `prefers-reduced-motion` 미디어 쿼리 존중

---

### 2.4 이미지 레이지 로딩 (Intersection Observer)

```typescript
// 패턴: 뷰포트 진입 시 이미지 로딩
// directives/lazyImage.ts
const vLazyImage: Directive<HTMLImageElement, string> = {
  mounted(el, binding) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.src = binding.value
        el.classList.remove('opacity-0')
        el.classList.add('opacity-100', 'transition-opacity', 'duration-300')
        observer.disconnect()
      }
    }, { rootMargin: '100px' })  // 100px 미리 로딩
    observer.observe(el)
  }
}
```

**적용 위치**: 메뉴 카드 이미지
**폴백**: 로딩 중 placeholder (배경색 또는 스켈레톤)

---

## 3. 보안 패턴 (Security Patterns)

### 3.1 토큰 관리 패턴 (Token Lifecycle)

```
토큰 라이프사이클:
  발급 → 저장 → 사용 → 갱신/만료 → 삭제

저장: localStorage (auth_token 키)
사용: 모든 API 요청에 Authorization: Bearer {token}
갱신: 401 수신 시 credentials로 재발급
삭제: 로그아웃, 세션 종료, 갱신 실패 시
```

**보안 규칙**:
- 토큰을 URL 파라미터에 포함하지 않음
- 콘솔 로그에 토큰 출력 금지 (프로덕션)
- 토큰 만료 시 즉시 삭제 (메모리 + localStorage)

---

### 3.2 입력 검증 패턴 (Input Sanitization Layer)

```typescript
// 패턴: 입력 → sanitize → validate → 사용
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')  // HTML 태그 제거
    .slice(0, 100)          // 최대 길이 제한
}

function validateTableNumber(input: string): number | null {
  const num = parseInt(input, 10)
  if (isNaN(num) || num < 1 || num > 999) return null
  return num
}
```

**적용 위치**: SetupView.vue 입력 처리
**원칙**: 모든 사용자 입력은 sanitize → validate 파이프라인 통과

---

### 3.3 CSP 적용 패턴 (Content Security Policy)

```
Nginx 헤더:
  Content-Security-Policy:
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline';
    img-src 'self' https:;
    connect-src 'self';
    font-src 'self';
    object-src 'none';
    frame-ancestors 'none';
```

**적용 위치**: Nginx 설정 (`nginx.conf`)
**`unsafe-inline` 허용 이유**: Tailwind CSS 인라인 스타일 필요

---

## 4. 접근성 패턴 (Accessibility Patterns)

### 4.1 ARIA Live Region 패턴

```html
<!-- 동적 콘텐츠 변경 알림 -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {{ statusMessage }}
</div>

<!-- 주문 상태 변경 시 스크린 리더 알림 -->
<!-- 토스트 알림 시 스크린 리더 알림 -->
```

**적용 위치**: 주문 상태 변경, 장바구니 추가 피드백, 에러 메시지

---

### 4.2 포커스 관리 패턴

```typescript
// 패턴: 모달/드로어 열기 시 포커스 트랩
function useFocusTrap(containerRef: Ref<HTMLElement | null>) {
  // 모달 열기 → 첫 번째 포커스 가능 요소로 이동
  // Tab 키 → 컨테이너 내부에서만 순환
  // 모달 닫기 → 트리거 요소로 포커스 복원
}
```

**적용 위치**: MenuDetailModal, ConfirmDialog, SideDrawer

---

### 4.3 색상 독립 상태 전달 패턴

```html
<!-- 색상 + 텍스트로 상태 전달 (색맹 사용자 고려) -->
<span
  :class="statusClasses"
  :aria-label="`주문 상태: ${statusText}`"
>
  {{ statusText }}
</span>
```

**원칙**: 색상만으로 정보를 전달하지 않음 (텍스트 + aria-label 병행)

---

## 5. 상태 관리 패턴 (State Management Patterns)

### 5.1 Optimistic Update 패턴 (장바구니)

```typescript
// 패턴: 즉시 UI 반영 → localStorage 동기화
function addItem(menu: MenuItem) {
  // 1. 즉시 상태 업데이트 (UI 반영)
  const existing = this.items.find(i => i.menuId === menu.id)
  if (existing) {
    existing.quantity++
  } else {
    this.items.push({ menuId: menu.id, name: menu.name, price: menu.price, quantity: 1, imageUrl: menu.imageUrl })
  }

  // 2. localStorage 동기화 (비동기적으로 안전하게)
  this.saveToStorage()
}
```

**적용 위치**: 장바구니 모든 조작 (서버 통신 없이 로컬 상태만)

---

### 5.2 Store Hydration 패턴 (앱 시작 시 복원)

```typescript
// 패턴: 앱 초기화 시 localStorage에서 상태 복원
// main.ts 또는 App.vue onMounted
async function initializeApp() {
  // 1. Cart 복원 (localStorage)
  cartStore.loadFromStorage()

  // 2. Auth 복원 (localStorage → 서버 검증)
  await authStore.loadFromStorage()

  // 3. 인증 성공 시 SSE 연결
  if (authStore.isAuthenticated) {
    sseStore.connect(authStore.tableId!)
  }
}
```

**적용 위치**: `App.vue` 또는 라우터 초기화
