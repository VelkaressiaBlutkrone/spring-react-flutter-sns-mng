/// 앱의 모든 비즈니스/데이터 예외를 나타내는 최상위 클래스.
///
/// RULE 7.3.2: DioException 등 외부 라이브러리 예외를 UI에 직접 노출하지 않고,
/// 의미를 부여한 AppException 계층으로 매핑하여 처리한다.
sealed class AppException implements Exception {
  const AppException(this.message);
  final String message;

  @override
  String toString() => message;
}

/// 네트워크 연결 관련 예외 (타임아웃, 연결 불가 등)
class NetworkException extends AppException {
  const NetworkException([super.message = '네트워크 오류가 발생했습니다.']);
}

/// 인증 실패 예외 (401 Unauthorized)
class UnauthorizedException extends AppException {
  const UnauthorizedException([super.message = '로그인이 필요합니다.']);
}

/// 인가 실패 예외 (403 Forbidden)
class ForbiddenException extends AppException {
  const ForbiddenException([super.message = '접근 권한이 없습니다.']);
}

/// API 요청 제한 초과 예외 (429 Too Many Requests)
class RateLimitException extends AppException {
  const RateLimitException([super.message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.']);
}

/// 서버 내부 오류 예외 (5xx)
class ServerException extends AppException {
  const ServerException([super.message = '서버 오류가 발생했습니다.']);
}

/// 요청한 리소스를 찾을 수 없는 예외 (404 Not Found)
class NotFoundException extends AppException {
  const NotFoundException([super.message = '요청한 리소스를 찾을 수 없습니다.']);
}

/// 서버 필드 검증 오류 DTO (백엔드 ErrorResponse.fieldErrors 대응)
class FieldErrorDto {
  const FieldErrorDto({
    required this.field,
    required this.value,
    required this.reason,
  });

  final String field;
  final String value;
  final String reason;
}

/// API 요청 실패 예외 (기존 코드 호환용)
class ApiException extends AppException {
  const ApiException([
    super.message = '요청 처리 중 오류가 발생했습니다.',
    this.code,
    this.fieldErrors,
  ]);

  const ApiException.detailed(
    this.code,
    String message,
    this.fieldErrors,
  ) : super(message);

  final String? code;
  final List<FieldErrorDto>? fieldErrors;
}

/// API 유효성 검사 실패 예외 (400 Bad Request with field errors)
class ApiValidationException extends AppException {
  const ApiValidationException(this.fieldErrors, [super.message = '입력값이 올바르지 않습니다.']);
  final Map<String, String> fieldErrors;
}

// --- Location Specific Exceptions ---

/// 위치 서비스 비활성화 예외
class AppLocationServiceDisabledException extends AppException {
  const AppLocationServiceDisabledException([super.message = '위치 서비스가 비활성화되어 있습니다.']);
}

/// 위치 권한 거부 예외
class AppLocationPermissionDeniedException extends AppException {
  const AppLocationPermissionDeniedException([super.message = '위치 권한이 거부되었습니다.']);
}

/// 위치 권한 영구 거부 예외
class AppLocationPermissionDeniedForeverException extends AppException {
  const AppLocationPermissionDeniedForeverException([super.message = '위치 권한이 영구적으로 거부되었습니다. 앱 설정에서 권한을 허용해주세요.']);
}
