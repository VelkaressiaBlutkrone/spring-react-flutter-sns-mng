# 7.3 Flutter 플랫폼 가이드 (Mobile App)

> 상위 문서: [07-platform.md](07-platform.md) | 원본: [RULE.md](../RULE.md) 7장
>
> **7.2 React**와 **8장 JS 규칙**과 동일한 원칙(보안 저장, 비동기·에러 처리, 네이밍 등)을 적용한다.
> 아래는 Flutter **특화 사항**만 기술한다.
>
> **기준 버전**: Flutter 3.x · Dart 3.x · Riverpod 3.0+

---

## 목차

1. [보안 저장소 사용](#731-보안-보안-저장소-사용)
2. [에러 처리 및 AppException 계층](#732-기술-에러-처리-및-appexception-계층)
3. [HTTP 클라이언트 공통화](#733-기술-http-클라이언트-공통화-dio)
4. [폴더 구조](#734-구조-폴더-구조-feature-based)
5. [상태 관리 (Riverpod 3.0+)](#735-기술-상태-관리-riverpod-30)
6. [위젯 크기 제한 및 단일 책임](#736-품질-위젯-크기-제한-및-단일-책임)
7. [Android / iOS 플랫폼 설정](#737-보안-android--ios-플랫폼-설정)
8. [API 응답 직렬화](#738-기술-api-응답-직렬화)
9. [이미지 캐싱 및 성능](#739-기술-이미지-캐싱-및-성능)
10. [로컬 영속성 (오프라인 지원)](#7310-기술-로컬-영속성-오프라인-지원)
11. [환경별 설정 (Flavor / Environment)](#7311-구조-환경별-설정-flavor--environment)
12. [라우팅](#7312-기술-라우팅)
13. [테스트 폴더 구조](#7313-품질-테스트-폴더-구조)

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

| 저장소                   | 용도                           | 비고                                                |
| ------------------------ | ------------------------------ | --------------------------------------------------- |
| `flutter_secure_storage` | 액세스·리프레시 토큰           | 암호화, 키체인/키스토어 사용                        |
| `SharedPreferences`      | 비민감 설정 값 (테마, 언어 등) | 평문 저장                                           |
| 메모리 (Riverpod)        | 현재 세션 상태                 | 앱 종료 시 소멸                                     |
| Hive / Isar / drift      | 오프라인 영속 데이터           | [7.3.10](#7310-기술-로컬-영속성-오프라인-지원) 참조 |

---

## 7.3.2 [기술] 에러 처리 및 AppException 계층

**Rule**: `DioException`을 UI까지 직접 노출하지 않고, **`AppException` 계층**으로 매핑하여 도메인 의미를 부여한다.

### AppException 정의

```dart
// core/error/app_exception.dart
sealed class AppException implements Exception {
  const AppException(this.message);
  final String message;
}

class NetworkException extends AppException {
  const NetworkException([super.message = '네트워크 오류가 발생했습니다.']);
}

class UnauthorizedException extends AppException {
  const UnauthorizedException([super.message = '로그인이 필요합니다.']);
}

class ServerException extends AppException {
  const ServerException([super.message = '서버 오류가 발생했습니다.']);
}

class NotFoundException extends AppException {
  const NotFoundException([super.message = '요청한 리소스를 찾을 수 없습니다.']);
}
```

### DioException → AppException 매핑

```dart
// core/network/exception_mapper.dart
AppException mapDioException(DioException e) => switch (e.type) {
  DioExceptionType.connectionTimeout ||
  DioExceptionType.receiveTimeout   => const NetworkException(),
  DioExceptionType.badResponse      => switch (e.response?.statusCode) {
    401 => const UnauthorizedException(),
    404 => const NotFoundException(),
    _   => ServerException('서버 오류 (${e.response?.statusCode})'),
  },
  _ => const NetworkException(),
};
```

### Repository에서 사용

```dart
class PostRepository {
  Future<List<Post>> getList() async {
    try {
      final res = await _dio.get('/api/posts');
      return (res.data as List).map(Post.fromJson).toList();
    } on DioException catch (e) {
      throw mapDioException(e);  // AppException으로 변환
    }
  }
}
```

### Notifier에서 사용

```dart
@riverpod
class PostListNotifier extends _$PostListNotifier {
  @override
  Future<List<Post>> build() async {
    return ref.read(postRepositoryProvider).getList();
    // AppException은 AsyncValue.error로 자동 래핑됨
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
      AuthInterceptor(),                        // 토큰 자동 주입·갱신
      LogInterceptor(responseBody: kDebugMode), // 개발 환경에서만 로그
    ]);

    return dio;
  }
}
```

- 직접 `Dio()` 생성 금지, Riverpod Provider로 주입
- 토큰 갱신 실패 시 `UnauthorizedException` 발생 → 로그인 화면 이동

---

## 7.3.4 [구조] 폴더 구조 (Feature-based)

**Rule**: Feature-based 구조를 기본으로 한다. `core/`와 `shared/`는 아래 기준으로 명확히 구분한다.

| 폴더        | 역할                  | 포함 내용                                    |
| ----------- | --------------------- | -------------------------------------------- |
| `core/`     | 인프라·설정 (UI 없음) | 네트워크, 저장소, 라우터, 에러 정의, DI 설정 |
| `shared/`   | 재사용 가능한 UI·유틸 | 공통 위젯, 테마, 포매터, 유효성 검사 함수    |
| `features/` | 도메인별 기능         | 각 기능의 data/domain/presentation 3계층     |

```text
lib/
├── core/
│   ├── network/          ← Dio 인스턴스, 인터셉터, ExceptionMapper
│   ├── storage/          ← SecureStorage 래퍼
│   ├── router/           ← GoRouter 설정
│   └── error/            ← AppException 계층
├── features/
│   ├── auth/
│   │   ├── data/         ← Repository, DataSource, DTO
│   │   ├── domain/       ← Entity, UseCase
│   │   └── presentation/ ← Screen, Widget, Notifier
│   ├── posts/
│   └── map/
├── shared/
│   ├── widgets/          ← 공통 위젯 (AppButton, AppTextField ...)
│   ├── theme/            ← 색상, 텍스트 스타일, ThemeData
│   └── utils/            ← 날짜 포매터, 유효성 검사 등
└── main.dart
```

---

## 7.3.5 [기술] 상태 관리 (Riverpod 3.0+)

**Rule**: Riverpod **3.0+** 기준, `@riverpod` 어노테이션(riverpod_generator)과 `AsyncNotifier`를 사용한다.
`StateNotifier`는 더 이상 권장하지 않는다.

### 기본 패턴

```dart
// features/posts/presentation/post_list_notifier.dart
@riverpod
class PostListNotifier extends _$PostListNotifier {
  @override
  Future<List<Post>> build() async {
    return ref.read(postRepositoryProvider).getList();
  }
}
```

### Family — 파라미터가 있는 Provider

```dart
// 특정 게시글 상세 조회
@riverpod
Future<Post> postDetail(Ref ref, int postId) async {
  return ref.read(postRepositoryProvider).getById(postId);
}

// 사용
final post = await ref.watch(postDetailProvider(postId).future);
```

### keepAlive — 앱 생존 시간 동안 캐시 유지

```dart
@Riverpod(keepAlive: true)
class AuthNotifier extends _$AuthNotifier {
  @override
  AuthState build() => const AuthState.unauthenticated();
  // 앱 전체 수명 동안 상태 유지
}
```

### 새로고침 (pull-to-refresh) — isRefreshing 패턴

```dart
// loading() 대신 현재 데이터 유지하며 새로고침 표시
Future<void> refresh() async {
  // 이전 데이터를 보여주면서 스피너만 표시 (UX 개선)
  state = state.copyWithIsRefreshing(true);
  state = await AsyncValue.guard(
    () => ref.read(postRepositoryProvider).getList(),
  );
}
```

```dart
// UI에서
Widget build(BuildContext context, WidgetRef ref) {
  final postsAsync = ref.watch(postListNotifierProvider);
  return RefreshIndicator(
    onRefresh: () => ref.read(postListNotifierProvider.notifier).refresh(),
    child: postsAsync.when(
      data: (posts) => PostListView(posts: posts),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => ErrorView(message: e.toString()),
      // isRefreshing 중에도 data 위젯 표시됨
    ),
  );
}
```

### Provider 버전 의존성

```yaml
# pubspec.yaml
dependencies:
  flutter_riverpod: ^3.0.0
  riverpod_annotation: ^3.0.0

dev_dependencies:
  riverpod_generator: ^3.0.0
  build_runner: ^2.4.0
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

## 7.3.8 [기술] API 응답 직렬화

**Rule**: DTO는 불변 객체로 정의한다. 팀 규모·`build_runner` 부담에 따라 아래 옵션 중 선택한다.

### 옵션 A — `freezed` + `json_serializable` (풀스택 불변, 권장)

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

- 장점: `copyWith`, `==`, `toString` 자동 생성, sealed class 지원
- 단점: `build_runner` 실행 필수, 코드 생성량 많음

### 옵션 B — `json_serializable`만 사용 (경량)

```dart
@JsonSerializable()
class PostResponse {
  const PostResponse({
    required this.id,
    required this.title,
    @JsonKey(name: 'created_at') required this.createdAt,
  });

  final int id;
  final String title;
  final String createdAt;

  factory PostResponse.fromJson(Map<String, dynamic> json) =>
      _$PostResponseFromJson(json);
}
```

- 장점: `freezed` 없이 가볍게 사용 가능
- 단점: `copyWith` 등 추가 기능 없음

### 옵션 C — `dart_mappable` (코드 생성 최소화)

```dart
@MappableClass()
class PostResponse with PostResponseMappable {
  const PostResponse({required this.id, required this.title});
  final int id;
  final String title;
}
```

- 장점: `build_runner` 의존 최소화, Dart 3 패턴매칭 친화적
- 단점: `freezed` 대비 생태계 작음

### 선택 기준

| 상황                                    | 권장 옵션                      |
| --------------------------------------- | ------------------------------ |
| 팀 표준, sealed/union 타입 필요         | 옵션 A (`freezed`)             |
| 소규모·빠른 프로토타입                  | 옵션 B (`json_serializable`만) |
| `build_runner` 빌드 시간 줄이고 싶을 때 | 옵션 C (`dart_mappable`)       |

---

## 7.3.9 [기술] 이미지 캐싱 및 성능

**Rule**: 네트워크 이미지는 `cached_network_image`로 캐싱하고, 리스트 스크롤 성능을 위해 `precacheImage`·`RepaintBoundary`를 활용한다.

### 기본 캐싱

```dart
// Good — 캐싱 + 로딩·오류 플레이스홀더
CachedNetworkImage(
  imageUrl: post.imageUrl,
  placeholder: (context, url) => const ShimmerPlaceholder(),
  errorWidget: (context, url, error) => const Icon(Icons.broken_image),
  fit: BoxFit.cover,
  memCacheWidth: 400,   // 메모리 캐시 크기 제한 (픽셀)
)
```

### 리스트 스크롤 성능

```dart
// 스크롤 전 이미지 미리 로드
@override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    for (final post in widget.posts.take(5)) {
      precacheImage(CachedNetworkImageProvider(post.imageUrl), context);
    }
  });
}
```

```dart
// 복잡한 카드 위젯에 RepaintBoundary 적용
ListView.builder(
  itemBuilder: (context, index) => RepaintBoundary(
    child: PostCard(post: posts[index]),
  ),
)
```

### 캐시 관리

```dart
// 수동 캐시 삭제 (설정 화면 등)
await CachedNetworkImage.evictFromCache(imageUrl);          // 특정 이미지
await DefaultCacheManager().emptyCache();                   // 전체 캐시
```

### 의존성

```yaml
dependencies:
  cached_network_image: ^3.4.0
  flutter_cache_manager: ^3.4.0 # cached_network_image 내부 사용, 직접 참조도 가능
```

---

## 7.3.10 [기술] 로컬 영속성 (오프라인 지원)

**Rule**: 네트워크 없이도 최근 데이터를 표시해야 하는 경우 로컬 DB를 사용한다. 용도에 맞는 라이브러리를 선택한다.

### 라이브러리 선택 기준

| 라이브러리          | 특징                                            | 적합한 경우                   |
| ------------------- | ----------------------------------------------- | ----------------------------- |
| **Isar**            | 고성능 NoSQL, Dart-native, 코드 생성            | 대용량 객체 저장, 복잡한 쿼리 |
| **drift** (구 moor) | SQLite 기반, type-safe 쿼리, Riverpod 통합 용이 | 관계형 구조, 복잡한 JOIN 필요 |
| **Hive**            | 경량 key-value, 설정 저장에 적합                | 단순 설정·캐시, 소규모 데이터 |
| **sqflite**         | Flutter 공식 SQLite 래퍼                        | 레거시 호환, 마이그레이션 중  |

### Isar 예시 (권장 — 2025~2026 주류)

```dart
// domain/entity/cached_post.dart
@collection
class CachedPost {
  Id id = Isar.autoIncrement;
  late String title;
  late String authorNickname;
  @Index()
  late DateTime cachedAt;
}
```

```dart
// data/local/post_local_datasource.dart
class PostLocalDataSource {
  final Isar _isar;

  Future<void> savePosts(List<Post> posts) async {
    await _isar.writeTxn(() async {
      await _isar.cachedPosts.putAll(posts.map(CachedPost.fromDomain).toList());
    });
  }

  Future<List<CachedPost>> getCachedPosts() =>
      _isar.cachedPosts
          .filter()
          .cachedAtGreaterThan(DateTime.now().subtract(const Duration(hours: 1)))
          .findAll();
}
```

### Repository에서 캐시-우선 전략 (Cache-first)

```dart
Future<List<Post>> getList() async {
  // 1. 캐시 반환
  final cached = await _localDs.getCachedPosts();
  if (cached.isNotEmpty) return cached.map(Post.fromCache).toList();

  // 2. 네트워크 조회 후 캐시 저장
  try {
    final posts = await _remoteDs.getList();
    await _localDs.savePosts(posts);
    return posts;
  } on NetworkException {
    if (cached.isEmpty) rethrow;
    return cached.map(Post.fromCache).toList();
  }
}
```

---

## 7.3.11 [구조] 환경별 설정 (Flavor / Environment)

**Rule**: API URL·키 등 환경별 설정은 **`--dart-define-from-file`** 또는 **`envied`**로 관리하고 코드에 하드코딩하지 않는다.

### 옵션 A — `--dart-define-from-file` (Flutter 공식, 권장)

```json
// config/env.dev.json
{
  "API_BASE_URL": "http://localhost:8080",
  "KAKAO_MAP_KEY": "dev-key-here"
}
```

```json
// config/env.prod.json
{
  "API_BASE_URL": "https://api.example.com",
  "KAKAO_MAP_KEY": "prod-key-here"
}
```

```bash
# 실행
flutter run --dart-define-from-file=config/env.dev.json

# 빌드
flutter build apk --dart-define-from-file=config/env.prod.json
```

```dart
// core/config/app_config.dart
class AppConfig {
  static const apiBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const kakaoMapKey = String.fromEnvironment('KAKAO_MAP_KEY');
}
```

### 옵션 B — `envied` (컴파일 타임 암호화, 보안 강화)

```dart
// core/config/env.dart
@Envied(path: '.env', obfuscate: true)  // 값을 난독화하여 바이너리 노출 방지
abstract class Env {
  @EnviedField(varName: 'API_BASE_URL')
  static final String apiBaseUrl = _Env.apiBaseUrl;

  @EnviedField(varName: 'KAKAO_MAP_KEY', obfuscate: true)
  static final String kakaoMapKey = _Env.kakaoMapKey;
}
```

### `.gitignore` 필수 추가

```gitignore
# 환경 설정 파일
config/env.*.json
.env
.env.*
lib/core/config/env.g.dart  # envied 생성 파일 (시크릿 포함)
```

### Flavor와 함께 사용 (멀티 환경 앱)

```bash
# Android flavor 정의는 android/app/build.gradle 에서
# iOS는 Xcode Scheme으로 관리

flutter run --flavor dev --dart-define-from-file=config/env.dev.json
flutter build apk --flavor prod --dart-define-from-file=config/env.prod.json
```

---

## 7.3.12 [기술] 라우팅

**Rule**: 라우팅은 **GoRouter**를 기본으로 사용한다. 타입 안전 라우팅이 필요한 경우 `go_router_builder` 또는 `auto_route`를 검토한다.

### GoRouter 기본 (권장)

```dart
// core/router/app_router.dart
@riverpod
GoRouter appRouter(Ref ref) {
  final authState = ref.watch(authNotifierProvider);
  return GoRouter(
    initialLocation: '/home',
    redirect: (context, state) {
      final isLoggedIn = authState is AuthAuthenticated;
      if (!isLoggedIn && !state.matchedLocation.startsWith('/auth')) {
        return '/auth/login';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
      GoRoute(path: '/auth/login', builder: (_, __) => const LoginScreen()),
      GoRoute(
        path: '/posts/:id',
        builder: (_, state) => PostDetailScreen(
          postId: int.parse(state.pathParameters['id']!),
        ),
      ),
    ],
  );
}
```

### 타입 안전 라우팅이 필요할 때 — `go_router_builder`

```dart
// 경로를 타입으로 정의 → 오탈자 방지
@TypedGoRoute<PostDetailRoute>(path: '/posts/:id')
class PostDetailRoute extends GoRouteData {
  const PostDetailRoute({required this.id});
  final int id;

  @override
  Widget build(BuildContext context, GoRouterState state) =>
      PostDetailScreen(postId: id);
}

// 이동
PostDetailRoute(id: 42).go(context);
```

### 라우팅 라이브러리 비교

| 라이브러리          | 타입 안전      | 복잡도 | 비고                             |
| ------------------- | -------------- | ------ | -------------------------------- |
| `go_router`         | 수동 파싱      | 낮음   | Flutter 공식, 대부분의 경우 충분 |
| `go_router_builder` | 자동 생성      | 중간   | `go_router` + 코드 생성          |
| `auto_route`        | 완전 타입 안전 | 높음   | 대규모·복잡한 네비게이션에 유리  |

---

## 7.3.13 [품질] 테스트 폴더 구조

**Rule**: 테스트 파일은 `lib/` 미러 구조로 `test/` 폴더 아래에 배치한다.

```text
test/
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   └── auth_repository_test.dart
│   │   ├── domain/
│   │   │   └── login_usecase_test.dart
│   │   └── presentation/
│   │       └── auth_notifier_test.dart
│   └── posts/
│       └── post_list_notifier_test.dart
├── core/
│   └── network/
│       └── exception_mapper_test.dart
└── shared/
    └── utils/
        └── date_formatter_test.dart
```

### Notifier 테스트 예시 (Riverpod 3.0+)

```dart
void main() {
  test('게시글 목록 로드 성공', () async {
    final container = ProviderContainer(overrides: [
      postRepositoryProvider.overrideWithValue(FakePostRepository()),
    ]);
    addTearDown(container.dispose);

    final notifier = container.read(postListNotifierProvider.notifier);
    await container.read(postListNotifierProvider.future);

    expect(
      container.read(postListNotifierProvider).value,
      isA<List<Post>>().having((l) => l, 'not empty', isNotEmpty),
    );
  });
}
```

### 테스트 종류별 폴더

| 폴더                | 테스트 종류                     |
| ------------------- | ------------------------------- |
| `test/`             | 단위 테스트 (Unit), 위젯 테스트 |
| `integration_test/` | 통합 테스트 (앱 전체 흐름)      |

---

## 참고 문서

- [07-platform-spring.md](07-platform-spring.md) — Spring Boot 플랫폼 가이드
- [07-platform-react.md](07-platform-react.md) — React 플랫폼 가이드
- [06-auth-token.md](06-auth-token.md) — 인증·토큰 관리
- [01-security.md](01-security.md) — 보안 공통 규칙
- [doc/FLUTTER_API_INTEGRATION.md](../FLUTTER_API_INTEGRATION.md) — Flutter API 연동 가이드
