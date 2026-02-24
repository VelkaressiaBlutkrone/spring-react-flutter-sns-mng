# Flutter Mobile 관련 문제

## 문제: 오류 시 메시지·로그가 출력되지 않아 디버깅 어려움

**증상:**

- API 오류, 연결 실패 시 화면에 아무 메시지도 표시되지 않음
- 콘솔에도 로그가 출력되지 않음

**원인:**

- `catch (_)` 등으로 예외를 삼키고 로깅 없음
- Dio 요청/응답 로그 미설정

**해결 방법 (적용됨):**

1. **AppLogger** (`lib/core/logger/app_logger.dart`): `kDebugMode`에서만 `debugPrint` 로그
2. **Dio LogInterceptor**: 디버그 모드에서 요청/응답 로그
3. **AuthRepository**: getCurrentUser, logout 실패 시 로그
4. **LoginScreen/JoinScreen**: 예외 catch 시 로그 + 네트워크 오류 시 사용자 메시지
5. **main.dart**: `runZonedGuarded`로 미처리 비동기 예외 로깅

**네트워크 오류 시 사용자 메시지:**

- "서버에 연결할 수 없습니다. Backend 실행 여부와 CORS를 확인하세요."
