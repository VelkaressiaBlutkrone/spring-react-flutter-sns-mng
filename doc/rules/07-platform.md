# 7. 플랫폼별 구현 가이드 (Platform-specific Implementation)

> 원본: [RULE.md](../RULE.md) 7장

각 플랫폼의 세부 규칙은 아래 문서를 참조한다.

---

## 플랫폼별 문서 목록

| 플랫폼 | 문서 | 주요 내용 |
|---|---|---|
| **Spring Boot** (Back-end) | [07-platform-spring.md](07-platform-spring.md) | 환경 변수 관리, 전역 에러 핸들러, URI 설계, 서비스 레이어, Security 설정 |
| **React** (Web Front-end) | [07-platform-react.md](07-platform-react.md) | XSS 방지, Axios 공통화, 폴더 구조, 컴포넌트 규칙, React Query, ErrorBoundary |
| **Flutter** (Mobile App) | [07-platform-flutter.md](07-platform-flutter.md) | 보안 저장소, 에러 처리, Dio 공통화, 폴더 구조, Riverpod 상태 관리 |

---

## 플랫폼 공통 원칙

아래 원칙은 모든 플랫폼에 공통으로 적용된다.

1. **보안**: 민감 정보(비밀번호, 토큰, API 키)는 환경 변수나 보안 저장소에 보관, 코드·버전 관리 노출 금지
2. **에러 처리**: 모든 예외는 캐치하여 사용자 친화적 메시지를 표시하고, 기술 상세는 내부 로그에만 기록
3. **API 공통화**: API 호출은 반드시 공통 클라이언트 인스턴스를 통해 처리, 토큰 자동 주입
4. **단일 책임**: 파일·컴포넌트·위젯은 하나의 책임만 담당, 크기 초과 시 분리
5. **불변 객체 우선**: DTO·설정은 불변 구조 (Java Record, `freezed`, `readonly` 등) 사용

---

## 관련 문서

- [01-security.md](01-security.md) — 보안 공통 규칙
- [06-auth-token.md](06-auth-token.md) — 인증·토큰 관리
- [08-javascript.md](08-javascript.md) — JS/TS 공통 규칙 (React·Flutter 공통 참조)
