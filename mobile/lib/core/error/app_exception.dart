/// RULE 7.3.2: DioException을 UI까지 직접 노출하지 않고 AppException 계층으로 매핑.
/// doc/rules/07-platform-flutter.md 기준.
sealed class AppException implements Exception {
  const AppException(this.message);
  final String message;
}

/// 네트워크 오류 (연결 실패, 타임아웃 등)
class NetworkException extends AppException {
  const NetworkException([super.message = '네트워크 오류가 발생했습니다.']);
}

/// 401 인증 필요
class UnauthorizedException extends AppException {
  const UnauthorizedException([super.message = '로그인이 필요합니다.']);
}

/// 403 권한 부족
class ForbiddenException extends AppException {
  const ForbiddenException([super.message = '접근 권한이 없습니다.']);
}

/// 404 Not Found
class NotFoundException extends AppException {
  const NotFoundException([super.message = '요청한 리소스를 찾을 수 없습니다.']);
}

/// 429 Rate Limit
class RateLimitException extends AppException {
  const RateLimitException([super.message = '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.']);
}

/// 4xx/5xx 서버 오류 (ErrorResponse 파싱)
class ApiException extends AppException {
  const ApiException([super.message = '오류가 발생했습니다.'])
      : code = null,
        fieldErrors = null;

  const ApiException.detailed(this.code, super.message, [this.fieldErrors]);

  /// ErrorResponse의 code
  final String? code;

  /// ErrorResponse의 fieldErrors (폼 필드별 에러 표시용)
  final List<FieldErrorDto>? fieldErrors;
}

/// API 필드 에러 (ErrorResponse.fieldErrors)
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
