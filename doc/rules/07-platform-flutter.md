# 7.3 Flutter 플랫폼 가이드 (Mobile App)

> 상위 문서: [07-platform.md](07-platform.md) | 원본: [RULE.md](../RULE.md) 7장
>
> **7.2 React**와 **8장 JS 규칙**과 동일한 원칙(보안 저장, 비동기·에러 처리, 네이밍 등)을 적용한다.
> 아래는 Flutter **특화 사항**만 기술한다.

---

## 7.3.1 [보안] 보안 저장소 사용

**Rule**: 민감한 데이터(자동 로그인 토큰 등)는 `SharedPreferences`가 아닌 **`flutter_secure_storage`**를 사용한다.

```dart
// Bad — 평문 저장, OS 백업에 포함될 수 있음
final prefs = await SharedPreferences.getInstance();
prefs.setString('token', accessToken);

// Good — Keychain(iOS) / Keystore(Android) 기반 암호화 저장
const storage = FlutterSecureStorage();
await storage.write(key: 'access_token', value: accessToken);
```

| 저장소 | 용도 | 비고 |
|---|---|---|
| `flutter_secure_storage` | 액세스·리프레시 토큰 | 암호화, 키체인/키스토어 사용 |
| `SharedPreferences` | 비민감 설정 값 (테마, 언어 등) | 평문 저장 |
| 메모리 (Provider/Riverpod) | 현재 세션 상태 | 앱 종료 시 소멸 |

---

## 7.3.2 [기술] 에러 처리 및 사용자 알림

**Rule**: 비동기 작업 시 반드시 **try-catch**를 사용하며, UI 레벨에서 사용자에게 에러 상황을 알린다.

```dart
// Good — try-catch + 사용자 피드백
Future<void> fetchPosts() async {
  try {
    final posts = await postRepository.getList();
    state = AsyncValue.data(posts);
  } on DioException catch (e) {
    state = AsyncValue.error(e, e.stackTrace);
    _showErrorSnackBar(e.message ?? '네트워크 오류가 발생했습니다.');
  } catch (e, st) {
    state = AsyncValue.error(e, st);
    _showErrorSnackBar('알 수 없는 오류가 발생했습니다.');
  }
}
```

- 사용자에게 보이는 에러 메시지는 기술적 상세 내용 노출 금지
- `print()` 디버그 로그는 프로덕션 빌드 전 제거 (또는 `kDebugMode` 조건 처리)

---

## 7.3.3 [기술] HTTP 클라이언트 공통화 (Dio)

**Rule**: 모든 API 호출은 **공통 Dio 인스턴스**를 사용하고, 인터셉터로 토큰 주입·갱신을 처리한다.

```dart
// core/network/dio_client.dart
class DioClient {
  static Dio create() {
    final dio = Dio(BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    dio.interceptors.addAll([
      AuthInterceptor(),   // 토큰 자동 주입·갱신
      LogInterceptor(responseBody: kDebugMode),
    ]);

    return dio;
  }
}
```

---

## 7.3.4 [구조] 폴더 구조 (Feature-based)

**Rule**: Feature-based 구조를 기본으로 하고, 공통 위젯·서비스는 `core/` 또는 `shared/`에 배치한다.

```text
lib/
├── core/
│   ├── network/        ← Dio 인스턴스, 인터셉터
│   ├── storage/        ← SecureStorage 래퍼
│   └── router/         ← GoRouter 설정
├── features/
│   ├── auth/
│   │   ├── data/       ← Repository, DataSource
│   │   ├── domain/     ← Entity, UseCase
│   │   └── presentation/ ← Screen, Widget, Provider/Riverpod
│   ├── posts/
│   └── map/
└── shared/
    ├── widgets/        ← 공통 위젯
    └── utils/          ← 공통 유틸
```

---

## 7.3.5 [기술] 상태 관리 (Riverpod 권장)

**Rule**: 상태 관리는 **Riverpod** 사용을 권장하며, `StateNotifier` + `AsyncValue` 패턴으로 서버 상태를 관리한다.

```dart
// Good — AsyncNotifierProvider
@riverpod
class PostListNotifier extends _$PostListNotifier {
  @override
  Future<List<Post>> build() async {
    return ref.read(postRepositoryProvider).getList();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() =>
        ref.read(postRepositoryProvider).getList());
  }
}
```

---

## 7.3.6 [품질] 위젯 크기 제한 및 단일 책임

**Rule**: 하나의 위젯 파일은 200줄 이하, 중첩 depth 4단계 초과 시 별도 위젯으로 분리한다.

```dart
// Bad — 한 파일에 너무 많은 책임
class PostScreen extends StatelessWidget {
  // ... 300줄 이상 ...
}

// Good — 역할별 분리
class PostScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PostAppBar(),
      body: PostListView(),       // 별도 위젯
      floatingActionButton: PostFab(),
    );
  }
}
```

---

## 7.3.7 [보안] Android / iOS 플랫폼 설정

### Android (`android/app/src/main/AndroidManifest.xml`)

```xml
<!-- 불필요한 권한 금지 -->
<uses-permission android:name="android.permission.INTERNET" />
<!-- 위치 필요 시에만 추가 -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

- `android:usesCleartextTraffic="true"` 는 개발 환경에서만 허용, 프로덕션 빌드 제거
- 앱 서명 키스토어 파일(`.jks`, `.keystore`)은 버전 관리에서 제외

### iOS (`ios/Runner/Info.plist`)

```xml
<!-- 권한 요청 사유 명시 필수 -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>지도 서비스를 위해 위치 정보가 필요합니다.</string>
```

---

## 7.3.8 [기술] API 응답 직렬화 (json_serializable)

**Rule**: API DTO는 `json_serializable` + `freezed`를 사용하여 불변 객체로 정의한다.

```dart
@freezed
class PostResponse with _$PostResponse {
  const factory PostResponse({
    required int id,
    required String title,
    required String authorNickname,
    @JsonKey(name: 'created_at') required String createdAt,
  }) = _PostResponse;

  factory PostResponse.fromJson(Map<String, dynamic> json) =>
      _$PostResponseFromJson(json);
}
```

---

## 참고 문서

- [07-platform-spring.md](07-platform-spring.md) — Spring Boot 플랫폼 가이드
- [07-platform-react.md](07-platform-react.md) — React 플랫폼 가이드
- [06-auth-token.md](06-auth-token.md) — 인증·토큰 관리
- [01-security.md](01-security.md) — 보안 공통 규칙
- [doc/FLUTTER_API_INTEGRATION.md](../FLUTTER_API_INTEGRATION.md) — Flutter API 연동 가이드
