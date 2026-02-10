# 8. 프론트엔드 JavaScript/TypeScript 코딩 규칙 (2026 ver.)

> **7.2 React**의 하위 세부 규칙이다. React·Vue·Next.js·Vite 등 프론트엔드 코드 작성 시 7.2와 본 장(8)을 함께 참조한다. 원본: [RULE.md](../RULE.md) 8장.

### TypeScript 기본 원칙 (2026)

- **가능하면 TypeScript 사용을 기본으로 한다.** 2025~2026년 신규 프론트엔드 프로젝트의 대부분이 TS 기반이므로, 신규 프로젝트는 TS를 전제로 한다.
- **ESLint + Prettier + typescript-eslint** 조합을 필수로 한다. ESLint 9+ **flat config** 사용 권장.
- 타입 정의·제네릭·strict 모드 등 상세 TS 규칙은 팀별 TS 가이드 또는 별도 규칙장에서 정의한다.

---

### 8.1 변수 & 상수 선언 규칙 (Variables & Constants)

| #   | Rule                                                                                                                                                                                              | 비고                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1   | **var는 절대 사용하지 않는다** (ES6 이후 완전 금지)                                                                                                                                               |                                                 |
| 2   | 재할당이 필요 없는 모든 변수는 **const**로 선언한다. (기본 원칙: const > let)                                                                                                                     |                                                 |
| 3   | 재할당이 반드시 필요한 경우에만 **let**을 사용한다. (for 루프의 i, j 등은 let 허용, for...of/forEach 내부에서는 const 추천)                                                                       |                                                 |
| 4   | const와 let은 **사용 직전에 선언**한다. (hoisting 문제 최소화)                                                                                                                                    |                                                 |
| 5   | 같은 스코프 내에서 const를 let보다 위에 선언한다. (가독성)                                                                                                                                        |                                                 |
| 6   | **전역 변수는 절대 사용하지 않는다.** (window.xxx, globalThis.xxx 직접 할당 금지. 필요 시 상태 관리 도구 사용)                                                                                    |                                                 |
| 7   | **네이밍**: 변수/함수 → camelCase, 상수(불변) → UPPER*SNAKE_CASE, 컴포넌트 → PascalCase. **private 필드**: 가능하면 **`#privateField`** 진짜 private 문법 사용 권장. 구식 환경은 `*` 접두사(옵션) | 예: `const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;` |

### 8.2 함수 선언 및 사용 규칙 (Functions)

| #   | Rule                                                                                                                                  | 비고 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | **네이밍**: camelCase, 동사 + 목적어 형태 권장. (좋음: fetchUserData, calculateTotalPrice, handleSubmit / 나쁨: fn, doIt, x)          |      |
| 2   | **화살표 함수**를 기본으로 사용 (특히 콜백, 짧은 함수). `function name() {}` 은 생성자, this 바인딩 필요, 재귀 함수에만 사용          |      |
| 3   | **async 함수**는 반드시 async 키워드 명시                                                                                             |      |
| 4   | 함수는 **한 가지 역할만** 수행. **20~25줄 이상**이면 책임 분리·리팩토링 검토. **컴포넌트당 로직 100줄 초과** 시 컴포지션·훅 분리 검토 |      |
| 5   | 매개변수 기본값 적극 활용: `function greet(name = 'Guest') {}`                                                                        |      |
| 6   | 반환은 early return 또는 단일 return 중 팀 컨벤션 따름                                                                                |      |
| 7   | 익명 함수는 거의 사용하지 않는다. (map, filter 등 짧은 화살표 함수는 예외 허용)                                                       |      |

### 8.3 비동기 처리 규칙 (Async/Await 중심)

| #   | Rule                                                                                                                                                                                                                                                                            | 비고                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | **비동기 처리 기본 방식은 async/await**. `.then().catch()` 체인은 최대한 피한다. 콜백 스타일(callback hell)은 절대 사용하지 않는다.                                                                                                                                             |                                                            |
| 2   | 모든 비동기 함수는 `async`로 선언한다.                                                                                                                                                                                                                                          | `async function fetchUser(id) { ... }`                     |
| 3   | Promise를 반환하는 함수는 **await 없이 호출하지 않는다**. (fire-and-forget 금지)                                                                                                                                                                                                |                                                            |
| 4   | 병렬 비동기 처리 시 **Promise.all** 적극 활용                                                                                                                                                                                                                                   | `const [user, posts, comments] = await Promise.all([...])` |
| 5   | **AbortController**는 **직접 fetch를 사용할 때** 또는 **커스텀 HTTP 클라이언트** 구현 시 적극 활용. (TanStack Query·axios 등은 자체 처리) 타임아웃·취소 가능 wrapper 권장.                                                                                                      |                                                            |
| 6   | **클라이언트** 로딩·에러 상태: **TanStack Query, SWR** 등 사용을 기본으로. **Next.js App Router** 환경에서는 **서버 컴포넌트 내 `fetch()` + `{ cache: 'force-cache' }` / `next: { revalidate } }`** 패턴을 1순위로 고려. 클라이언트에서만 필요한 경우에 TanStack Query 등 사용. |                                                            |

### 8.4 예외 및 오류 처리 규칙 (Error Handling)

| #   | Rule                                                                                                                                                                                                | 비고 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | **async 함수 내에서는 반드시 try-catch 사용**                                                                                                                                                       |      |
| 2   | **커스텀 에러 클래스** 적극 활용 (도메인별 에러 구분. 예: AuthError, NetworkError)                                                                                                                  |      |
| 3   | **최상위 레벨**에서 전역 에러 핸들링: React **ErrorBoundary**. React 18+에서는 **ErrorBoundary + `use()`** 패턴 병행 고려. Next.js `_error.tsx` / `global-error.tsx`, Vue `app.config.errorHandler` |      |
| 4   | **console.\*** 메서드는 개발 환경에서만 사용. 프로덕션 빌드에서는 **제거** 권장: `eslint-plugin-no-console` + 빌드 시 strip 조합. 에러·모니터링은 Sentry, Datadog, LogRocket 등으로 전송.           |      |
| 5   | **Promise rejection은 반드시 catch 처리**. unhandledrejection 이벤트는 모니터링 도구에 연결                                                                                                         |      |
| 6   | 예상 가능한 에러(404, 401, 403 등) → 사용자 친화적 메시지로 변환. 예상치 못한 에러(500, 네트워크 오류) → "알 수 없는 오류가 발생했습니다" + 재시도 버튼 제공                                        |      |

### 8.5 네이밍 컨벤션 전체 요약

| 대상         | 규칙                                                        | 예시                              |
| ------------ | ----------------------------------------------------------- | --------------------------------- |
| 변수·함수    | camelCase                                                   | `fetchUserData`, `handleSubmit`   |
| 상수(불변)   | UPPER_SNAKE_CASE                                            | `MAX_UPLOAD_SIZE`, `API_BASE_URL` |
| 컴포넌트     | PascalCase                                                  | `UserProfile`, `LoginForm`        |
| private 필드 | **`#privateField`** 권장 (진짜 private) / `_` 접두사 (옵션) | `#internalCache`                  |

### 8.6 금지 패턴 (Do Not)

- ❌ **var** 사용
- ❌ **.then().catch()** 체인 남용 (async/await 우선)
- ❌ **전역 변수** (window.xxx, globalThis.xxx 직접 할당)
- ❌ **fire-and-forget** (Promise 반환 함수를 await 없이 호출)
- ❌ **콜백 지옥** (callback hell)
- ❌ **dangerouslySetInnerHTML** 직접 사용 (XSS 위험). **필요 시 DOMPurify 등으로 sanitization 필수** 후 제한적 사용.

### 8.7 추천 라이브러리 & 패턴

| 용도            | 추천 (2026 우선순위)                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| 서버 상태·캐싱  | **Next.js App Router**: 서버 `fetch` + cache/revalidate 1순위. 클라이언트: TanStack Query, SWR          |
| 폼·입력 검증    | **Zod**를 데이터 검증 기본으로 (폼 + API 응답 스키마). React Hook Form, Yup                             |
| 에러 모니터링   | Sentry, Datadog, LogRocket                                                                              |
| 상태 관리       | **Zustand > Jotai** (jotai/utils, Zustand middleware) > Redux Toolkit (레거시 유지 시)                  |
| HTTP 클라이언트 | **fetch 기반 ky, ofetch** 권장. Axios는 레거시 프로젝트에서만 유지. 직접 fetch 시 AbortController 활용. |
| 린트·포맷       | **ESLint + Prettier + typescript-eslint** 필수. ESLint 9+ **flat config** 사용 권장.                    |

---

### 8.8 React Server Components (RSC) & 현대 React 패턴 (2026)

- **서버 컴포넌트**에서는 `useState`, `useEffect` 등 **클라이언트 전용 훅 사용 금지**. 데이터 조회는 서버에서 `async` 컴포넌트 또는 `fetch` + cache/revalidate로 처리.
- **`"use client"`** 지시자는 **클라이언트 훅·이벤트·브라우저 API**가 필요한 컴포넌트에만 명시. 가능한 한 서버 컴포넌트를 기본으로 두고 클라이언트 경계를 최소화한다.
- **Suspense + streaming**: 비동기 UI는 **`<Suspense fallback={<Loading />}>`** 패턴을 기본으로 사용. 로딩 상태를 선언적으로 처리한다.
- **Partial Prerendering (PPR)** (Next.js 14~15): 정적/동적 경계를 명확히 하고, 동적 구간만 스트리밍하도록 레이아웃을 설계한다.
