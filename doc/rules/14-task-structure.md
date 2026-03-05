# Task 문서 작성 구조

> Task 문서(`doc/TASK.md`, `doc/TASK_SERVER.md`, `doc/TASK_WEB.md`, `doc/TASK_MOBILE.md` 등)를 **새로 작성**하거나 **Step을 추가**할 때 반드시 아래 구조를 준수한다.
> 참조: [04-quality.md](04-quality.md) 4.3절

### 용어 정의

| 용어     | 의미                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------ |
| **TASK** | 문서 단위. `/TASK_SERVER.md`, `/TASK_WEB.md` 등 하나의 md 파일이 하나의 TASK 문서이다.                                   |
| **Step** | TASK 문서 내 개별 작업 단위. 1장의 필수 필드(Step Name, Step Goal, Done When, Scope 등)로 정의되는 하나의 작업 블록이다. |

---

## 1. 필수 필드 정의

| 필드               | 설명                                                              |
| ------------------ | ----------------------------------------------------------------- |
| **Step Name**      | 단계 이름                                                         |
| **Step Goal**      | 측정 가능한 목표 문장 (아래 1.1 참조)                             |
| **Input**          | 이 단계에 필요한 입력(문서·코드·환경 등)                          |
| **Scope**          | In Scope / Out of Scope 구조 (아래 1.3 참조)                      |
| **Instructions**   | 수행할 작업 목록                                                  |
| **Output Format**  | 산출물 형태·위치·형식                                             |
| **Constraints**    | 이번 Step에서 지켜야 하는 구체적 규칙·제약                        |
| **Done When**      | 이 Step 완료로 간주하는 성공 기준 (Step Goal 바로 다음 고정 배치) |
| **Duration**       | 예상 작업일 (인력 1명 기준)                                       |
| **RULE Reference** | 참조 문서 위치 (예: RULE 1.2, 04-quality.md 4.2절)                |
| **Assignee**       | 담당자 (선택)                                                     |
| **Reviewer**       | 리뷰어 (선택)                                                     |

### 1.1 Step Goal — 측정 가능 문장 강제

Step Goal은 **구체적 행위 + 결과** 형태로 작성한다. 수동태("가능해야 한다")보다 능동태("한다")가 권장된다.

**형식:** `[주체]가 [대상]에 대해 [행위]를 [결과]한다.` 또는 `[주체]가 [행위]할 수 있다.`

| ❌ 부적절 예시          | ✅ 적절 예시                                                         |
| ----------------------- | -------------------------------------------------------------------- |
| 게시글 좋아요 기능 구현 | 로그인 사용자가 게시글에 좋아요를 **최대 1회만 등록**할 수 있다.     |
| 회원 관리 기능          | 관리자가 회원을 **상태별로 검색**하고 **일괄 정지**할 수 있다.       |
| API 개발                | 비로그인 사용자가 게시글 목록을 **페이지네이션으로 조회**할 수 있다. |

### 1.2 Done When — 고정 배치 (강제)

**Done When**은 Step의 가장 중요한 성공 기준이다. **Step Goal 바로 다음**에 반드시 배치한다.

**고정 배치:** Step Name → **Step Goal** → **Done When** → Scope → Input → ...

### 1.3 Scope — In Scope / Out of Scope 고정 구조

Scope는 **In Scope**와 **Out of Scope**를 명시적으로 구분한다. PR 확장 방지를 위해 반드시 준수한다.

**형식:**

```
Scope
- In Scope:
  - (포함 항목 1)
  - (포함 항목 2)
- Out of Scope:
  - (제외 항목 1)
  - (제외 항목 2)
  - (향후 고려 예정 1)
```

**예시 (게시글 좋아요):**

- **In Scope:**
  - 좋아요 등록
  - 좋아요 취소
  - 좋아요 수 조회
- **Out of Scope:**
  - 좋아요 알림 기능
  - 실시간 WebSocket 반영
  - 좋아요 누른 사용자 목록 노출
  - 좋아요 취소 시 알림
  - _향후 고려:_ 좋아요 수 실시간 캐시 갱신

### 1.4 Constraints vs RULE Reference 구분

| 필드               | 의미                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **Constraints**    | 이번 Step에서 **지켜야 하는 구체적 규칙·제약** (예: "인증 필수", "트랜잭션 readOnly", "N+1 방지") |
| **RULE Reference** | **참조 문서 위치** (예: `RULE 1.2`, `04-quality.md 4.2절`) — 상세 내용은 해당 문서 참조           |

**원칙:** RULE에 정의된 규칙은 **RULE Reference**에, 해당 Step 고유 제약은 **Constraints**에 작성한다.
(예: "JWT 만료 시 401 반환" → RULE 6에 정의되어 있으면 RULE Reference에 `RULE 6` 기재, Step별 추가 조건만 Constraints에)

### 1.5 강제 사항

- 신규 Step 추가 시 위 **10개 필수 필드**를 모두 작성한다. (Assignee, Reviewer는 협업 시 선택)
- 기존 Step 수정 시 해당 필드가 있다면 내용을 **갱신**한다.
- 필드 누락 시 코드 리뷰에서 보완 요청 대상이 된다.

---

## 2. 기능 개발 Workflow

> Task 문서 내에서 **동작하는 기능**을 개발할 때 아래 Workflow를 따른다.
> 각 단계는 순차적으로 진행하며, 필요 시 이전 단계로 돌아가 수정할 수 있다.
>
> **1장과의 연결**: 1장에서 정의한 **필수 필드**는 아래 Workflow의 각 단계에서 Task 문서에 작성한다. 2.2 표의 "문서 작성" 열을 참조한다.

### 2.1 Workflow 다이어그램

```
TASK 시작  ← Step Name, Step Goal, Done When, Scope, Input, Duration(rough)
    ↓
요구사항 분석  ← Instructions 초안, Constraints
    ↓
Security 1차 검토  ← 체크리스트 → Constraints 반영
    ↓
ERD 설계  ← Duration(final) 갱신
    ↓
Security 2차 검토  ← 체크리스트 → Constraints 반영
    ↓
    DTO/Entity 설계 (철학 분기 — 2.3 참조)
    ├─ API First:    DTO 설계 → Entity
    └─ Domain First: Entity → DTO 설계
    ↓
Repository
    ↓
Service 구현 ──→ Service Test (병행)
    ↓
Controller 구현 ──→ Controller Test (병행)
    ↓
View 구현 ──→ View Test (Smoke 1건 이상 필수)
```

### 2.2 단계별 설명

> 각 단계에서 **1장의 필수 필드**를 Task 문서에 작성한다. 작성 시점은 아래 표의 "문서 작성" 열을 참조한다.

| 순서 | 단계                  | 설명                                                                   | 문서 작성                                                                              |
| ---- | --------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1    | **TASK 시작**         | 기능 범위·목표 정의, 관련 문서(PRD, RULE) 확인                         | **Step Name**, **Step Goal**, **Done When**, **Scope**, **Input**, **Duration**(rough) |
| 2    | **요구사항 분석**     | 기능 요구사항 정리, 입력/출력·비즈니스 규칙·예외 케이스 파악           | **Instructions** 초안, **Constraints**                                                 |
| 3    | **Security 1차 검토** | 권한 구조 기획 (아래 체크리스트)                                       | 체크리스트 결과를 **Constraints**에 반영                                               |
| 4    | **ERD 설계**          | 필요한 테이블·컬럼·관계 추가/수정, `doc/ERD.md` 반영                   | **Duration**(final) 갱신                                                               |
| 5    | **Security 2차 검토** | 데이터 유출 방지·물리적 제약 (아래 체크리스트)                         | 체크리스트 결과를 **Constraints**에 반영                                               |
| 6    | **DTO / Entity**      | 설계 철학에 따라 순서 결정 (아래 2.3 참조)                             | **Output Format**                                                                      |
| 7    | **Repository**        | JpaRepository 확장, 커스텀 쿼리(QueryDSL/JPA) 작성                     | —                                                                                      |
| 8    | **Service + Test**    | 비즈니스 로직 구현 후 **즉시** 단위 테스트 작성                        | —                                                                                      |
| 9    | **Controller + Test** | REST/MVC 컨트롤러 구현 후 **즉시** 슬라이스 테스트 작성 (401/403 포함) | —                                                                                      |
| 10   | **View + Test**       | 화면 구현. 웹/모바일 TASK: Storybook·Cypress smoke 등 기본 적용        | **RULE Reference**                                                                     |

#### Security 1차 검토 체크리스트

> 체크 결과는 Step의 **Constraints** 필드에 반영한다.

- [ ] **인증 필요 여부**: 이 API/기능 호출에 로그인이 필요한가?
- [ ] **권한 종류**: 호출자 역할(일반/관리자/특정 권한) 구분이 필요한가?
- [ ] **공개 API 여부**: 비로그인 접근 허용 시 Rate Limiting·입력 검증 강화 필요

#### Security 2차 검토 체크리스트

> 체크 결과는 Step의 **Constraints** 필드에 반영한다.

- [ ] **민감 정보 암호화**: ERD 상 개인정보·비밀번호 등 암호화 컬럼 적용 여부
- [ ] **Soft Delete**: 물리 삭제 vs 논리 삭제, 복구 정책
- [ ] **접근 제어**: 행 단위 권한(Row-level) 필요 여부 (본인 데이터만 조회 등)

### 2.3 DTO vs Entity 순서 — 설계 철학 명시

프로젝트별 설계 철학에 따라 **DTO → Entity** 또는 **Entity → DTO** 순서가 달라진다.

| 철학             | 순서         | 적합한 경우                                         |
| ---------------- | ------------ | --------------------------------------------------- |
| **API First**    | DTO → Entity | REST API 중심, 외부 계약(API 스펙)을 먼저 확정할 때 |
| **Domain First** | Entity → DTO | DDD/도메인 중심, 내부 도메인 모델을 우선 설계할 때  |

> **본 프로젝트 기본 철학**
>
> REST API 기반(Web + Mobile 연동)이므로 **API First**를 기본으로 한다.
> → DTO 설계 → Entity 순서 적용. 단, 도메인 복잡도가 높은 기능은 팀 합의로 Entity 우선을 허용한다.

### 2.4 Test — 구현과 병행

Test를 단일 마지막 단계로 두지 않고, **구현 직후 테스트**를 병행한다.

| 구현 단계  | 테스트 유형           | 비고                                                   |
| ---------- | --------------------- | ------------------------------------------------------ |
| Service    | 단위 테스트 (Mockito) | `@ExtendWith(MockitoExtension.class)`                  |
| Controller | 슬라이스 테스트       | `@WebMvcTest` + `@MockBean`, 401/403 검증              |
| View       | Smoke·Storybook 등    | **Smoke test 1건 이상 필수**, Visual Regression은 선택 |

### 2.5 Workflow 적용 예시

**예: 게시글 좋아요 기능 추가** (2.2의 10단계에 매핑)

| 순서 | 단계                  | 적용 내용                                                                                                                                                                                                  |
| ---- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **TASK 시작**         | Step Goal: "로그인 사용자가 게시글에 좋아요를 **최대 1회만 등록**할 수 있다." / Done When: API·View 동작 검증 완료 / Scope: In(등록·취소·조회) Out(알림·WebSocket·사용자 목록 등) / Duration(rough): 2~3일 |
| 2    | **요구사항 분석**     | Instructions: 좋아요 요청·취소 API, 중복 방지, 좋아요 수 집계 / Constraints: 인증 필수 / RULE Reference: RULE 1.2, 04-quality 4.2                                                                          |
| 3    | **Security 1차 검토** | [x] 인증 필요 [x] 권한: 로그인 사용자 [ ] 공개 API 아님 → **Constraints에 반영**                                                                                                                           |
| 4    | **ERD 설계**          | `post_like` 테이블 (post_id, member_id, created_at), unique(post_id, member_id) / **Duration(final): 2일**                                                                                                 |
| 5    | **Security 2차 검토** | [x] 민감정보 없음 [x] Soft Delete 불필요 [x] 행 단위 권한 불필요 → **Constraints에 반영**                                                                                                                  |
| 6    | **DTO / Entity**      | DTO: `PostLikeRequest`, `PostLikeResponse` (likeCount) → Entity: `PostLike` (Post, Member 연관)                                                                                                            |
| 7    | **Repository**        | `PostLikeRepository` (existsByPostIdAndMemberId, countByPostId)                                                                                                                                            |
| 8    | **Service + Test**    | `PostLikeService.toggle()` 구현 → 단위 테스트 (toggle, 중복 체크 시나리오)                                                                                                                                 |
| 9    | **Controller + Test** | `POST/DELETE /api/posts/{id}/like` 구현 → 슬라이스 테스트 (401/403)                                                                                                                                        |
| 10   | **View + Test**       | 좋아요 버튼·아이콘·카운트 표시 / Smoke test 1건 이상                                                                                                                                                       |

---

## 3. 참조

- **품질 규칙**: [04-quality.md](04-quality.md)
- **보안 규칙**: [01-security.md](01-security.md)
- **기술 규칙**: [03-technical.md](03-technical.md)
