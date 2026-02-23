# 7.2 React 플랫폼 가이드 (Web Front-end)

> 상위 문서: [07-platform.md](07-platform.md) | JS/TS 공통 규칙: [08-javascript.md](08-javascript.md)

프론트엔드에서는 **입력값 검증**과 **인증 토큰 관리**가 핵심이다.

---

## 7.2.1 [보안] XSS 방지 및 상태 관리

**Rule**: 사용자 입력값을 렌더링할 때 `dangerouslySetInnerHTML` 사용을 **금지**하며, API 통신 시 토큰은 **메모리**나 **HttpOnly 쿠키**에 저장한다.

```tsx
// Bad — XSS 위험
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Good — 텍스트로만 렌더링
<div>{userInput}</div>
```

| 저장소 | 용도 | 비고 |
|---|---|---|
| JS 메모리 (Zustand 등) | 액세스 토큰 | 탭 종료 시 소멸 |
| HttpOnly 쿠키 | 리프레시 토큰 | JS에서 접근 불가 |
| `localStorage` | 민감 정보 저장 **금지** | XSS로 탈취 가능 |

---

## 7.2.2 [기술] API 인스턴스 공통화

**Rule**: 모든 API 호출은 **공통 Axios 인스턴스**를 사용하며, 헤더에 토큰을 자동으로 주입한다.

```typescript
// api/client.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) redirectToLogin();
    if (err.response?.status === 403) {
      useAuthStore.getState().clearAuth();
      if (globalThis.window !== undefined) globalThis.window.location.href = '/';
    }
    throw err;
  }
);
```

- 직접 `axios.get(...)` 호출 금지, 반드시 공통 인스턴스 사용
- 각 도메인별 API 모듈(`auth.ts`, `posts.ts` 등)은 `apiClient`만 import

---

## 7.2.3 폴더 구조 (Feature-based + Atomic Design)

**Rule**: Feature-based 구조를 기본으로 하고, 공통 컴포넌트는 Atomic Design 계층(Atoms, Molecules, Organisms)을 적용한다.

```text
web/src/
├── api/              ← 도메인별 API 모듈 (auth.ts, posts.ts ...)
├── components/       ← 공통 컴포넌트 (Atomic)
│   ├── atoms/        ← Button, Input, Badge ...
│   ├── molecules/    ← SearchBar, PostCard ...
│   └── organisms/    ← Header, Sidebar, MapView ...
├── hooks/            ← 커스텀 훅 (useGeolocation, useAuth ...)
├── pages/            ← 페이지 컴포넌트 (라우트 단위)
├── store/            ← Zustand 상태 (authStore ...)
├── utils/            ← 순수 유틸 함수 (haversine, imageUrl ...)
└── types/            ← 공통 타입 정의
```

---

## 7.2.4 컴포넌트·타입 구성 규칙

**Rule**: Functional Component + Hooks만 사용(Class Component 금지), Props는 `interface`로 명시, 컴포넌트당 150줄 이하, 단일 책임 원칙(SRP).

```tsx
// Good — Props interface + readonly + FC
export interface CardProps {
  readonly title: string;
  readonly description?: string;
  readonly onClick?: () => void;
}

export function Card({ title, description, onClick }: CardProps) {
  return (
    <div onClick={onClick} className="rounded-xl border p-4">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}
```

| 규칙 | 내용 |
|---|---|
| Class Component | **금지** — Functional + Hooks 전용 |
| Props 타입 | `interface` 사용, 모든 필드에 `readonly` |
| 컴포넌트 크기 | 150줄 초과 시 분리 |
| 단일 책임 | 1 컴포넌트 = 1 관심사 |

---

## 7.2.5 JSX/TSX 구조 레벨 제한

| Rule | 설명 |
|---|---|
| **Depth 제한** | JSX 중첩 3~4단계 초과 시 새 컴포넌트로 분리 |
| **Early return** | if/else 중첩 금지, 조건부 렌더링은 early return |
| **Fragment** | 불필요한 `<div>` 금지, `<>` 또는 `<Fragment>` 사용 |
| **Props spreading** | `{...props}` 금지, 명시적 prop 전달 |
| **Children prop** | `children`은 마지막 prop으로 배치 |

```tsx
// Bad — 깊은 중첩
<div>
  <div>
    <div>
      <div>너무 깊음</div>
    </div>
  </div>
</div>

// Good — 컴포넌트 분리
<OuterLayout>
  <InnerContent />
</OuterLayout>
```

---

## 7.2.6 스타일링 방식

**Rule**: Tailwind CSS + `clsx` + `tailwind-merge` 패턴 권장. `cn()` 유틸로 조건부 클래스 합성.

```typescript
// utils/cn.ts
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
// 사용 예
<button
  className={cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition',
    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
  )}
>
  버튼
</button>
```

- 인라인 `style={}` 는 동적 색상 등 Tailwind로 표현 불가한 경우에만 허용
- CSS Modules / styled-components 혼용 금지

---

## 7.2.7 ESLint·Prettier 설정

**Rule**: `prettier`는 `extends` 마지막에 배치, React 17+ JSX transform·TypeScript 사용 시 `react/prop-types` off.

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

## 7.2.8 컴포넌트 export 순서

파일 하단 export 순서:

```typescript
// 1. default export (컴포넌트)
export default MyComponent;

// 2. named type export
export type { MyComponentProps };

// 3. 필요 시 re-export
export * from './types';
```

---

## 7.2.9 [기능] React Query 사용 기준

**Rule**: 서버 상태는 `@tanstack/react-query`, 클라이언트 상태는 `zustand`로 관리한다.

```typescript
// 서버 상태 — useQuery
const { data, isLoading } = useQuery({
  queryKey: ['posts', page],
  queryFn: () => postsApi.list({ page }),
  staleTime: 1000 * 60,  // 1분
});

// 클라이언트 상태 — zustand
const user = useAuthStore((s) => s.user);
```

| 상태 유형 | 도구 | 비고 |
|---|---|---|
| 서버 데이터 (API 응답) | React Query | 캐싱·재검증 자동화 |
| 인증·테마 등 전역 UI 상태 | Zustand | 미들웨어 없이 단순 사용 |
| 폼·로컬 인터랙션 | `useState` | 컴포넌트 내 한정 |

---

## 7.2.10 [기능] 에러 경계 (ErrorBoundary)

**Rule**: 앱 루트에 `ErrorBoundary`를 배치하여 런타임 오류를 잡고 사용자 친화적 폴백 UI를 표시한다.

```tsx
// main.tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
```

---

## 참고 문서

- [08-javascript.md](08-javascript.md) — JS/TS 공통 규칙 (비동기, 네이밍 등)
- [06-auth-token.md](06-auth-token.md) — 인증·토큰 관리
- [07-platform-spring.md](07-platform-spring.md) — Spring Boot 플랫폼 가이드
- [07-platform-flutter.md](07-platform-flutter.md) — Flutter 플랫폼 가이드
