# refactoring → web 마이그레이션 변경사항 보고서

> **목적**: `refactoring/`의 모든 기능을 `web/`에 덮어쓸 경우 변경되어야 하는 내용 정리
> **작성일**: 2026-03-12

---

## 1. 아키텍처 차이 요약

| 항목         | `refactoring/` (소스)                      | `web/` (대상)                          |
| ------------ | ------------------------------------------ | -------------------------------------- |
| **구조**     | Full-stack (Express + React) 단일 프로젝트 | Frontend-only, Spring Boot 백엔드 연동 |
| **UI 패턴**  | 단일 페이지 + 모달/오버레이 중심           | 다중 페이지 + React Router             |
| **상태관리** | `useMapSNS.ts` 단일 훅 (~1800줄)           | Zustand + TanStack Query (분리형)      |
| **백엔드**   | Express + SQLite (server.ts 내장)          | Spring Boot (localhost:8080) 프록시    |
| **DB**       | SQLite (better-sqlite3)                    | Spring Boot JPA (외부)                 |

---

## 2. 기술 스택 변경사항

### 2.1 추가해야 할 의존성 (refactoring에 있고 web에 없는 것)

| 패키지                      | 용도                        | 비고                                        |
| --------------------------- | --------------------------- | ------------------------------------------- |
| `lucide-react`              | 아이콘 시스템               | web은 `@mui/icons-material` 사용 중         |
| `clsx` + `tailwind-merge`   | 조건부 클래스 유틸 (`cn()`) | web에 없음                                  |
| `express`                   | 백엔드 서버                 | **제거 대상** — Spring Boot로 대체          |
| `better-sqlite3`            | SQLite DB                   | **제거 대상** — Spring Boot JPA로 대체      |
| `bcryptjs` / `jsonwebtoken` | 인증                        | **제거 대상** — Spring Boot Security로 대체 |
| `@google/genai`             | Gemini Live Audio API       | 음성 비서 기능                              |
| `cors`, `multer`, `dotenv`  | 서버 미들웨어               | **제거 대상**                               |

### 2.2 제거될 의존성 (web에 있고 refactoring에 없는 것)

| 패키지                         | 용도                   | 영향                                     |
| ------------------------------ | ---------------------- | ---------------------------------------- |
| `@mui/material` + `@emotion/*` | UI 컴포넌트 라이브러리 | 전체 UI 스타일 변경                      |
| `@mui/icons-material`          | MUI 아이콘             | Lucide로 교체                            |
| `recharts`                     | 통계 차트              | 관리자 통계 페이지 영향                  |
| `react-masonry-css`            | 이미지 그리드          | 이미지 게시글 레이아웃 영향              |
| `@tanstack/react-query`        | 서버 상태 관리         | **주의**: refactoring은 로컬 상태로 처리 |

### 2.3 버전 변경

| 패키지             | web (현재) | refactoring (소스)        |
| ------------------ | ---------- | ------------------------- |
| `vite`             | 7.3.1      | 6.2.0 (**다운그레이드**)  |
| `react`            | 19.2.3     | 19.0.0 (**다운그레이드**) |
| `typescript`       | 5.7.2      | 5.8.x (**업그레이드**)    |
| `react-router-dom` | 7.6.1      | 7.13.1                    |
| `tailwindcss`      | 4.1.18     | 4.1.14 (**다운그레이드**) |

---

## 3. 기능 비교 — 상세

### 3.1 refactoring에만 있는 기능 (web에 추가 필요)

| 기능                | 파일                                                          | 설명                                      |
| ------------------- | ------------------------------------------------------------- | ----------------------------------------- |
| **팔로우/언팔로우** | `useMapSNS.ts`, `FollowListModal.tsx`, `ProfilePage.tsx`      | 사용자 간 팔로우 관계, 팔로워/팔로잉 목록 |
| **좋아요(Like)**    | `useMapSNS.ts`, `PostOverlay.tsx`                             | 게시글 좋아요/취소                        |
| **알림 시스템**     | `NotificationModal.tsx`, `useMapSNS.ts`                       | 팔로우·좋아요·멘션 알림                   |
| **음성 비서**       | `VoiceAssistant.tsx`, `liveAudioService.ts`                   | Google Gemini Live API 기반 음성 인터랙션 |
| **메시지 오버레이** | `MessagesOverlay.tsx`                                         | 사용자 간 메시지 UI (placeholder)         |
| **설정 오버레이**   | `SettingsOverlay.tsx`                                         | 앱 설정 패널                              |
| **고급 필터**       | `FilterOverlay.tsx`                                           | 카테고리, 날짜, 거리 기반 필터링          |
| **마커 클러스터링** | `App.tsx`                                                     | Kakao 마커 클러스터러                     |
| **사용자 검색**     | `SearchOverlay.tsx`, `useMapSNS.ts`                           | 닉네임/이메일 기반 사용자 검색            |
| **프로필 페이지**   | `ProfilePage.tsx`, `ProfileModal.tsx`, `ProfileEditModal.tsx` | 팔로워 수, 게시글 수, 소개 편집           |
| **핀 CRUD**         | `PinModal.tsx`, `PinOverlay.tsx`                              | 핀 생성/수정/삭제 모달                    |
| **경로 계획**       | `RouteOverlay.tsx`                                            | Kakao Mobility 경로 탐색 오버레이         |
| **확인 모달**       | `ConfirmationModal.tsx`                                       | 범용 확인/취소 다이얼로그                 |
| **액션 모달**       | `ActionModal.tsx`                                             | 지도 클릭 시 액션 선택                    |

### 3.2 web에만 있는 기능 (덮어쓰면 소실)

| 기능                    | 파일                                                     | 설명                                  |
| ----------------------- | -------------------------------------------------------- | ------------------------------------- |
| **관리자 패널**         | `pages/admin/*` (7개 페이지)                             | 회원·게시글·이미지게시글 관리, 통계   |
| **이미지 게시글**       | `ImagePost*.tsx` (4개 페이지), `api/imagePosts.ts`       | 별도 이미지 게시글 CRUD               |
| **통계 대시보드**       | `AdminStatsPage.tsx`, `StatsChart.tsx`, `StatsTable.tsx` | Recharts 기반 가입·로그인·게시글 통계 |
| **공지 기능**           | `AdminPostListPage.tsx`                                  | 게시글 공지 토글                      |
| **에러 바운더리**       | `ErrorBoundary.tsx`                                      | 프로덕션 에러 처리                    |
| **Private/Admin Route** | `PrivateRoute.tsx`, `AdminRoute.tsx`                     | 라우트 가드                           |
| **Masonry 그리드**      | `MasonryGrid.tsx`                                        | 이미지 게시글 반응형 그리드           |
| **MUI 테마**            | `theme/*`                                                | Material Design 테마 시스템           |
| **Prettier 설정**       | `.prettierrc`, `.prettierignore`                         | 코드 포매팅                           |
| **거리 표시**           | `DistanceDisplay.tsx`, `haversine.ts`                    | Haversine 거리 계산 컴포넌트          |
| **카카오 맵 링크**      | `KakaoMapLinks.tsx`, `kakaoMapLinks.ts`                  | 길찾기·로드뷰 외부 링크               |

---

## 4. 파일 단위 변경 목록

### 4.1 설정 파일

| 파일                      | 변경 유형                | 상세                                                |
| ------------------------- | ------------------------ | --------------------------------------------------- |
| `package.json`            | **전체 교체**            | 의존성 목록 완전 변경, scripts 변경                 |
| `vite.config.ts`          | **교체** (`.js` → `.ts`) | proxy 설정 제거, TailwindCSS 플러그인 방식 변경     |
| `tsconfig.json`           | **교체**                 | target ES2022, path alias 방식 변경                 |
| `tsconfig.node.json`      | **삭제**                 | refactoring에 없음                                  |
| `index.html`              | **교체**                 | Kakao SDK 로딩 방식 동일하나 구조 변경              |
| `eslint.config.js`        | **삭제**                 | refactoring에 없음                                  |
| `postcss.config.js`       | **삭제**                 | refactoring은 Vite 플러그인으로 Tailwind 처리       |
| `tailwind.config.js`      | **삭제**                 | TailwindCSS 4.x는 CSS 기반 설정 사용                |
| `.prettierrc`             | **삭제**                 | refactoring에 없음                                  |
| `.prettierignore`         | **삭제**                 | refactoring에 없음                                  |
| `.env.example`            | **교체**                 | `VITE_*` 키 → `GEMINI_API_KEY`, `KAKAO_REST_KEY` 등 |
| `.env.production.example` | **삭제**                 | refactoring에 없음                                  |
| `server.ts`               | **추가**                 | Express 백엔드 서버 (Spring Boot와 충돌 가능)       |
| `metadata.json`           | **추가**                 | PWA 메타데이터                                      |

### 4.2 소스 디렉토리 구조 변경

```
삭제되는 디렉토리/파일 (web에만 존재):
  src/api/              → 전체 삭제 (refactoring은 services/api.ts 단일 파일)
  src/types/            → 전체 삭제 (refactoring은 src/types.ts 단일 파일)
  src/theme/            → 전체 삭제 (MUI 테마 제거)
  src/config/           → 전체 삭제
  src/icons/            → 전체 삭제 (Lucide로 대체)
  src/animations/       → 전체 삭제 (motion/react 직접 사용)
  src/utils/haversine.ts
  src/utils/imageUrl.ts
  src/utils/kakaoMapLinks.ts
  src/components/admin/
  src/pages/admin/
  src/pages/ImagePost*.tsx (4개)
  src/pages/PostListPage.tsx
  src/pages/PostDetailPage.tsx
  src/pages/PostCreatePage.tsx
  src/pages/PostEditPage.tsx
  src/pages/LoginPage.tsx
  src/pages/SignupPage.tsx
  src/pages/AboutPage.tsx
  src/pages/HomePage.tsx
  src/pages/MePage.tsx
  src/pages/MeEditPage.tsx
  src/pages/PinPostsPage.tsx
  src/components/AppLayout.tsx
  src/components/AuthInitializer.tsx
  src/components/ErrorBoundary.tsx
  src/components/PrivateRoute.tsx
  src/components/AdminRoute.tsx
  src/components/MapView.tsx
  src/components/MapWithLocation.tsx
  src/components/LocationPicker.tsx
  src/components/PinMarker.tsx
  src/components/PostMarker.tsx
  src/components/DistanceDisplay.tsx
  src/components/KakaoMapLinks.tsx
  src/components/MasonryGrid.tsx
  src/hooks/useAuth.ts
  src/hooks/useGeolocation.ts
  src/vite-env.d.ts

추가되는 디렉토리/파일 (refactoring에만 존재):
  src/constants.ts
  src/types.ts
  src/utils/cn.ts
  src/services/api.ts
  src/services/liveAudioService.ts
  src/store/useAuthStore.ts
  src/hooks/useMapSNS.ts
  src/pages/ProfilePage.tsx
  src/components/VoiceAssistant.tsx
  src/components/common/Tooltip.tsx
  src/components/layout/NavItem.tsx
  src/components/feed/PostFeed.tsx
  src/components/map/SearchOverlay.tsx
  src/components/map/FilterOverlay.tsx
  src/components/map/RouteOverlay.tsx
  src/components/map/PostOverlay.tsx
  src/components/map/PinOverlay.tsx
  src/components/map/PlaceOverlay.tsx
  src/components/map/MessagesOverlay.tsx
  src/components/map/SettingsOverlay.tsx
  src/components/modals/AuthModal.tsx
  src/components/modals/ActionModal.tsx
  src/components/modals/PostModal.tsx
  src/components/modals/PinModal.tsx
  src/components/modals/ProfileModal.tsx
  src/components/modals/ProfileEditModal.tsx
  src/components/modals/NotificationModal.tsx
  src/components/modals/ConfirmationModal.tsx
  src/components/modals/FollowListModal.tsx
  server.ts
  metadata.json
  docs/PROJECT_FEATURES.md
```

---

## 5. API 연동 변경사항

### 5.1 현재 web의 API 구조 (Spring Boot 연동)

```
api/client.ts     → Axios 인스턴스, JWT 인터셉터, baseURL: VITE_API_BASE_URL
api/auth.ts       → POST /api/auth/login, POST /api/auth/refresh, POST /api/auth/logout
api/members.ts    → POST /api/members (회원가입)
api/me.ts         → GET /api/me, PATCH /api/me, GET /api/me/posts, GET /api/me/pins
api/posts.ts      → CRUD /api/posts, GET /api/posts/nearby
api/imagePosts.ts → CRUD /api/image-posts, GET /api/image-posts/nearby
api/pins.ts       → CRUD /api/pins, GET /api/pins/nearby
api/map.ts        → POST /api/map/directions
api/admin/*       → 관리자 API
```

### 5.2 refactoring의 API 구조 (내장 Express)

```
services/api.ts   → Axios 인스턴스, baseURL: '' (같은 서버)
server.ts 내장 엔드포인트:
  POST /api/auth/register
  POST /api/auth/login
  GET/POST /api/posts
  GET/PUT/DELETE /api/posts/:id
  POST /api/posts/:id/like
  GET/POST /api/pins
  GET/PUT/DELETE /api/pins/:id
  POST /api/routes
  GET /api/routes/user/:userId
  POST /api/follow/:userId
  DELETE /api/follow/:userId
  GET /api/followers/:userId
  GET /api/following/:userId
  GET /api/notifications
  PUT /api/notifications/:id/read
  GET /api/users/search
  GET/PUT /api/users/:id
```

### 5.3 마이그레이션 시 필요한 백엔드 API 추가

refactoring 기능을 Spring Boot에서 지원하려면 다음 엔드포인트가 필요:

| 엔드포인트                     | 메서드      | 설명                    |
| ------------------------------ | ----------- | ----------------------- |
| `/api/posts/{id}/like`         | POST/DELETE | 좋아요 토글             |
| `/api/follow/{userId}`         | POST/DELETE | 팔로우/언팔로우         |
| `/api/followers/{userId}`      | GET         | 팔로워 목록             |
| `/api/following/{userId}`      | GET         | 팔로잉 목록             |
| `/api/notifications`           | GET         | 알림 목록               |
| `/api/notifications/{id}/read` | PUT         | 알림 읽음 처리          |
| `/api/users/search`            | GET         | 사용자 검색             |
| `/api/users/{id}`              | GET/PUT     | 사용자 프로필 조회/수정 |
| `/api/routes`                  | POST        | 경로 저장               |
| `/api/routes/user/{userId}`    | GET         | 사용자 경로 목록        |

---

## 6. UI/UX 패러다임 전환

| 항목            | web (현재)                       | refactoring (변경 후)      |
| --------------- | -------------------------------- | -------------------------- |
| **네비게이션**  | 페이지 이동 (React Router)       | 지도 위 오버레이/모달 전환 |
| **레이아웃**    | AppLayout (헤더+사이드바+콘텐츠) | 전체화면 지도 + 플로팅 UI  |
| **게시글 목록** | 별도 페이지 (PostListPage)       | 피드 오버레이 (PostFeed)   |
| **게시글 작성** | 별도 페이지 (PostCreatePage)     | 모달 (PostModal)           |
| **로그인**      | 별도 페이지 (LoginPage)          | 모달 (AuthModal)           |
| **관리자**      | 별도 라우트 그룹 (/admin/\*)     | **없음** — 별도 구현 필요  |
| **아이콘**      | MUI Icons (18종)                 | Lucide React               |
| **컴포넌트**    | MUI (Button, TextField 등)       | 순수 Tailwind HTML         |
| **차트**        | Recharts                         | **없음**                   |

---

## 7. 위험 요소 및 주의사항

### 7.1 Critical — 데이터 손실 위험

1. **관리자 기능 전체 소실**: web의 admin 페이지 7개 + admin API 모듈이 삭제됨
2. **이미지 게시글 기능 소실**: ImagePost 관련 4개 페이지 + API 삭제됨
3. **통계 기능 소실**: Recharts 기반 통계 대시보드 삭제됨
4. **에러 바운더리 소실**: 프로덕션 에러 처리 컴포넌트 삭제됨
5. **라우트 가드 소실**: PrivateRoute, AdminRoute 인증 보호 삭제됨

### 7.2 High — 백엔드 호환성

1. **server.ts 충돌**: refactoring의 Express 서버는 Spring Boot와 공존 불가 → 제거하고 Spring Boot API 활용 필요
2. **API 경로 불일치**: refactoring의 API 경로가 Spring Boot 컨트롤러와 다름 → `services/api.ts` 전면 수정 필요
3. **인증 방식 차이**: refactoring은 JWT Bearer 토큰, web은 HttpOnly 쿠키 + refresh 토큰 → 인증 로직 재구현 필요
4. **DB 스키마 차이**: SQLite 테이블 구조 vs JPA 엔티티 → 신규 기능(팔로우, 좋아요, 알림) 엔티티 추가 필요

### 7.3 Medium — UI/UX

1. **MUI → Tailwind 전환**: 모든 MUI 컴포넌트가 순수 Tailwind으로 변경됨
2. **다중 페이지 → 단일 페이지**: 기존 사용자의 URL 북마크, SEO 등 영향
3. **반응형 레이아웃 변경**: AppLayout 기반에서 전체화면 지도 기반으로 전환

---

## 8. 권장 마이그레이션 전략

### Option A: 완전 교체 (Full Override)

`web/src/` 전체를 `refactoring/src/`로 교체 후, 다음을 추가 작업:

1. `server.ts` 제거 → Spring Boot 백엔드 유지
2. `services/api.ts`를 web의 `api/client.ts` 패턴으로 재구성 (baseURL, 인터셉터)
3. 관리자 페이지를 refactoring 스타일로 재구현 (모달/오버레이)
4. Spring Boot에 팔로우/좋아요/알림 API 추가
5. 이미지 게시글 기능을 refactoring에 통합

### Option B: 기능 선택 병합 (Selective Merge)

web 구조를 유지하면서 refactoring의 신규 기능만 이식:

1. 팔로우/좋아요/알림 컴포넌트 + API 모듈 추가
2. 음성 비서 기능 추가
3. 지도 필터/검색 오버레이 추가
4. 마커 클러스터링 추가
5. 기존 MUI + 관리자 + 이미지게시글 기능 유지

### Option C: 하이브리드 (권장)

refactoring의 지도 중심 UI를 메인으로 채택하되:

1. web의 관리자 패널을 별도 라우트(`/admin/*`)로 유지
2. web의 이미지 게시글 기능을 refactoring 모달 패턴으로 재구현
3. web의 API 레이어 패턴(모듈 분리)을 채택하여 refactoring의 단일 훅 분리
4. web의 인증 플로우(HttpOnly cookie + refresh)를 유지

---

## 9. 작업 체크리스트 (Option A 기준)

- [ ] `web/src/` 백업
- [ ] 설정 파일 교체 (package.json, tsconfig.json, vite.config.ts, index.html)
- [ ] `web/src/` → `refactoring/src/` 내용으로 교체
- [ ] `server.ts` 제외 (Spring Boot 사용)
- [ ] `services/api.ts` baseURL을 `VITE_API_BASE_URL`로 변경
- [ ] 인증 로직을 Spring Boot 방식으로 재구현
- [ ] Spring Boot 백엔드에 신규 API 추가 (팔로우, 좋아요, 알림, 사용자검색)
- [ ] JPA 엔티티 추가 (follows, likes, notifications 테이블)
- [ ] 관리자 기능 재구현 또는 별도 유지
- [ ] 이미지 게시글 기능 통합
- [ ] `npm install` 후 빌드 테스트
- [ ] E2E 기능 테스트
