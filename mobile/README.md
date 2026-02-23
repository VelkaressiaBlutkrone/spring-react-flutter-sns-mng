# Map SNS Mobile (Flutter)

> TASK_MOBILE Step 1~2 기준. doc/TASK_MOBILE.md, doc/API_SPEC.md, doc/AUTH_DESIGN.md 참고.

## 빌드·실행

### 기본 실행 (로컬 Backend)

```bash
cd mobile
flutter pub get
flutter run
```

### 환경 변수(dart-define)로 API Base URL 지정

```bash
# 개발 서버 (localhost:8080)
flutter run --dart-define=API_BASE_URL=http://localhost:8080

# 프로덕션
flutter run --dart-define=API_BASE_URL=https://api.example.com
```

### dart-define-from-file 사용 (여러 변수)

`config/env.dev.json` 예시:

```json
{
  "API_BASE_URL": "http://localhost:8080",
  "MAP_API_KEY": ""
}
```

실행:

```bash
flutter run --dart-define-from-file=config/env.dev.json
```

### APK 빌드

```bash
flutter build apk --dart-define=API_BASE_URL=https://api.example.com
```

---

## 패키지 구조 (lib/)

| 디렉터리 | 역할 |
|----------|------|
| `core/` | 설정, 상수, 에러(AppException), DI |
| `data/` | ApiClient, TokenStorage, AuthRepository |
| `domain/` | 모델·DTO (doc/API_SPEC.md 기반) |
| `presentation/` | 화면·위젯 (Step 3 이후 구현) |

### API·인증 (Step 2)

- **ApiClient**: Dio + Bearer 인터셉터, 401 시 Refresh 자동 갱신
- **TokenStorage**: flutter_secure_storage (RULE 6.1.6)
- **AuthRepository**: login, refreshToken, logout, getCurrentUser
- **모바일 로그인**: `X-Client: mobile` 헤더로 Refresh Token 본문 수신

### DTO·모델 (domain/models/)

- `MemberResponse`, `MemberJoinRequest`, `MemberUpdateRequest`
- `LoginRequest`, `LoginResponse`
- `PostResponse`, `PostCreateRequest`, `PostUpdateRequest`
- `ImagePostResponse`
- `PinResponse`, `PinCreateRequest`, `PinUpdateRequest`
- `PageResponse<T>`, `ErrorResponse`, `FieldError`

---

## 환경 변수 (RULE 1.1)

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `API_BASE_URL` | Backend API 베이스 URL | `http://localhost:8080` |
| `MAP_API_KEY` | 지도 API Key (Kakao/Google 등) | `""` |

---

## 의존성

- `dio` — HTTP 클라이언트
- `flutter_secure_storage` — 토큰·민감 정보 저장
- `geolocator` — 위치 권한·좌표 조회
