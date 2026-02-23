/// 앱 환경 설정 (TASK_MOBILE Step 1).
///
/// RULE 1.1: API Base URL·API Key는 환경 변수 또는 dart-define으로 주입.
/// 실행 예: flutter run --dart-define=API_BASE_URL=http://localhost:8080
/// 빌드 예: flutter build apk --dart-define=API_BASE_URL=https://api.example.com
class AppConfig {
  AppConfig._();

  /// Backend API 베이스 URL (예: http://localhost:8080, https://api.example.com)
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8080',
  );

  /// 지도 API Key (Kakao/Google/Naver 등). 사용 시 dart-define으로 주입.
  static const String mapApiKey = String.fromEnvironment(
    'MAP_API_KEY',
    defaultValue: '',
  );
}
