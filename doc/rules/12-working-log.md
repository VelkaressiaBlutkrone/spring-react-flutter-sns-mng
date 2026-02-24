# Working Log Rule

> 본 문서는 AI 협업 프로젝트에서 작성되는 Working Log의 작성 기준과 구조를 정의합니다.
> 모든 AI 작업 결과물에는 아래 규칙에 따라 Working Log가 반드시 수반되어야 합니다.

---

## 1. 목적 (Purpose)

Working Log는 단순 작업 기록이 아니라 아래 네 가지 목적을 동시에 충족해야 합니다.

| 목적            | 설명                                                            |
| --------------- | --------------------------------------------------------------- |
| **지시 재현성** | 어떤 프롬프트/지시로 해당 결과가 생성되었는지 추적 가능해야 함  |
| **판단 추적성** | AI가 어떤 가정을 했고, 무엇을 생략하거나 확장했는지 명시해야 함 |
| **결과 검증성** | 요구사항 충족 여부를 명확히 확인할 수 있어야 함                 |
| **개선 루프**   | 다음 지시에서 무엇을 보완해야 하는지 도출할 수 있어야 함        |

---

## 2. 로그 구조 (Top-Level Structure)

모든 Working Log는 아래 9개 섹션을 순서대로 포함해야 합니다.

```
[WORKING LOG]

1. Task Metadata
2. Original Instruction (Input)
3. AI Interpretation / Assumptions
4. Execution Details
5. Output Summary
6. Requirement Validation
7. Issues & Gaps
8. Improvement / Next Instruction
9. Versioning & Trace
```

---

## 3. 항목별 작성 규칙 (Section Rules)

---

### 1️⃣ Task Metadata — 작업 메타 정보

**목적:** 동일 작업의 재실행, 비교, 회귀 분석을 가능하게 함

**작성 형식:**

```
[TASK METADATA]
- Task ID        : {프로젝트코드}-{YYYY-MM-DD}-{일련번호}   (예: AI-2026-02-23-001)
- Date           : YYYY-MM-DD
- Requested By   : 요청자 이름 또는 팀
- AI Model       : 사용한 AI 모델명 및 버전
- Context        : 작업 도메인 / 목적 (예: Backend 설계 / 문서 자동화)
- Priority       : High / Medium / Low
```

**규칙:**

- Task ID는 프로젝트 전체에서 유일해야 함
- AI Model은 정확한 버전까지 기재 (재현성 확보)
- Priority는 팀 내 정의된 기준에 따라 부여

---

### 2️⃣ Original Instruction — 원본 작업 지시

**목적:** 지시 내용을 왜곡 없이 기록하여 결과와 지시 간 정합성 검토 가능

**작성 형식:**

```
[USER INSTRUCTION]
{실제 입력된 프롬프트 또는 지시 내용을 그대로 기재}
```

**규칙:**

- **절대 요약 또는 편집 금지** — 원문 그대로 기록
- 지시가 다단계인 경우 각 단계별로 구분하여 기록
- 채팅 기반 지시인 경우 대화 흐름 전체를 포함 가능

---

### 3️⃣ AI Interpretation / Assumptions — AI 해석 및 가정

**목적:** 결과가 어긋났을 때 문제 지점을 명확히 분리 (지시 문제 vs. 해석 문제)

**작성 형식:**

```
[AI INTERPRETATION]
- {AI가 해석한 작업의 핵심 의도}
- {확장하거나 가정한 사항}
- {생략하거나 제외한 사항과 그 이유}
```

**규칙:**

- AI가 임의로 판단한 모든 사항을 빠짐없이 기록
- 지시에 명시되지 않았으나 포함/제외한 항목은 반드시 이유와 함께 기재
- 가정이 잘못되었을 경우를 대비해 "~로 가정함" 형식 사용 권장

---

### 4️⃣ Execution Details — 실행 과정

**목적:** 결과 도출 과정의 투명성 확보 및 재현 가능한 절차 기록

**작성 형식:**

```
[EXECUTION]
- {수행한 주요 단계 또는 접근 방식}
- {참조한 내부 규칙, 문서, 템플릿}
- {적용된 제약 조건: 토큰, 포맷, 언어, 도구 등}
```

**규칙:**

- 결과에 직접 영향을 미친 실행 단계만 선별하여 기록
- 사용한 참조 자료는 링크 또는 문서명으로 명시
- 제약 조건(예: 최대 토큰, 출력 언어 등)은 반드시 포함

---

### 5️⃣ Output Summary — 결과물 요약

**목적:** 핵심 산출물을 의사결정 단위로 요약하여 가독성 확보

**작성 형식:**

```
[OUTPUT SUMMARY]
- {결과물의 핵심 내용 요약}
- {제안/설계/생성된 주요 항목}
- {결과물의 형식 및 위치 (파일명, URL 등)}
```

**규칙:**

- 결과물 전체를 붙여넣는 것이 아니라 **의사결정 단위로 요약**
- 산출물이 파일인 경우 파일명과 저장 위치 명시
- 결과물이 여러 개인 경우 번호를 매겨 구분

---

### 6️⃣ Requirement Validation — 요구사항 충족 여부

**목적:** 지시 대비 결과물의 완성도를 객관적으로 평가

**작성 형식:**

```
[VALIDATION]
✔ {요구사항 항목}    : 충족 / 부분 충족 / 미충족
✔ {요구사항 항목}    : 충족 / 부분 충족 / 미충족
✖ {요구사항 항목}    : 충족 / 부분 충족 / 미충족
```

**규칙:**

- Original Instruction의 모든 요구사항을 항목화하여 체크
- `✔` 충족 / `△` 부분 충족 / `✖` 미충족으로 구분
- 부분 충족 및 미충족 항목은 이유를 한 줄 이상 보충 설명

---

### 7️⃣ Issues & Gaps — 문제점 및 공백

**목적:** AI 결과의 한계를 투명하게 기록하여 다음 지시의 정확도 향상

**작성 형식:**

```
[ISSUES]
- {발견된 문제점 또는 누락 사항}
- {품질 저하 원인 또는 불확실한 가정}
- {외부 요인으로 인한 제약}
```

**규칙:**

- AI 결과의 한계는 **반드시** 기록 (누락 시 로그 무효 처리)
- 문제점은 원인과 함께 기술 (단순 나열 금지)
- 해결책이 있는 경우 8번 항목으로 연결

---

### 8️⃣ Improvement / Next Instruction — 개선 및 다음 지시

**목적:** 개선 루프를 명문화하여 반복 작업의 품질을 단계적으로 향상

**작성 형식:**

```
[NEXT ACTION]
- {다음 작업 지시에서 보완해야 할 사항}
- {추가로 요청할 작업 또는 검증 항목}
- {담당자 또는 후속 Task ID (예정)}
```

**규칙:**

- 7번 Issues와 반드시 연동하여 작성
- "~를 추가 요청" / "~를 수정 지시" 형식의 실행 가능한 문장으로 기술
- 후속 Task가 예정된 경우 Task ID를 미리 부여하여 연결

---

### 9️⃣ Versioning & Trace — 버전 및 이력 추적

**목적:** 작업 이력 관리 및 로그 간 연관 관계 추적

**작성 형식:**

```
[TRACE]
- Log Version  : v{Major}.{Minor}
- Previous     : {이전 Task ID 또는 N/A}
- Next         : {후속 Task ID 또는 TBD}
- Related Task : {연관 Task ID 목록}
- Changed By   : {이 버전을 작성/수정한 사람}
```

**규칙:**

- 최초 작성 시 `v1.0`, 내용 수정 시 Minor 버전 증가, 구조 변경 시 Major 버전 증가
- 이전 Task와 연속성이 있는 경우 Previous에 반드시 기재
- 동일 Task의 재실행 시 버전을 올리고 변경 이유를 한 줄로 추가

---

## 4. 전체 템플릿 (Copy & Use)

```markdown
[WORKING LOG]

## 1. Task Metadata

- Task ID :
- Date :
- Requested By :
- AI Model :
- Context :
- Priority :

## 2. Original Instruction

[USER INSTRUCTION]

## 3. AI Interpretation / Assumptions

## [AI INTERPRETATION]

-

## 4. Execution Details

## [EXECUTION]

-

## 5. Output Summary

## [OUTPUT SUMMARY]

-

## 6. Requirement Validation

[VALIDATION]
✔ :
✔ :
✖ :

## 7. Issues & Gaps

## [ISSUES]

-

## 8. Improvement / Next Instruction

## [NEXT ACTION]

-

## 9. Versioning & Trace

[TRACE]

- Log Version : v1.0
- Previous : N/A
- Next : TBD
- Related Task :
- Changed By :
```

---

## 5. 준수 원칙 요약 (Compliance Summary)

| 원칙            | 내용                                           |
| --------------- | ---------------------------------------------- |
| **원문 보존**   | Original Instruction은 절대 요약·편집 금지     |
| **가정 명시**   | AI 해석 및 가정은 빠짐없이 기록                |
| **한계 공개**   | Issues & Gaps는 생략 불가                      |
| **연속성 유지** | Versioning으로 로그 간 연결 관계 명시          |
| **실행 가능성** | Next Instruction은 실행 가능한 지시문으로 작성 |

---

_본 Rule은 v1.0 기준이며, 프로젝트 운영 중 발견되는 개선 사항에 따라 버전이 갱신됩니다._
| **원문 보존** | Original Instruction은 절대 요약·편집 금지 |
| **가정 명시** | AI 해석 및 가정은 빠짐없이 기록 |
| **한계 공개** | Issues & Gaps는 생략 불가 |
| **연속성 유지** | Versioning으로 로그 간 연결 관계 명시 |
| **실행 가능성** | Next Instruction은 실행 가능한 지시문으로 작성 |

---

_본 Rule은 v1.0 기준이며, 프로젝트 운영 중 발견되는 개선 사항에 따라 버전이 갱신됩니다._
