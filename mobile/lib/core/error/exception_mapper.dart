// DioException → AppException 매핑 (RULE 7.3.2). doc/rules/07-platform-flutter.md
import 'package:dio/dio.dart';

import '../../domain/models/error_response.dart';
import 'app_exception.dart';

/// DioException을 AppException으로 변환
AppException mapDioException(DioException e) {
  if (e.response != null) {
    final status = e.response!.statusCode ?? 0;
    final data = e.response!.data;
    if (data is Map<String, dynamic>) {
      try {
        final err = ErrorResponse.fromJson(data);
        return ApiException.detailed(
          err.code,
          err.message,
          err.fieldErrors
              .map((f) => FieldErrorDto(
                    field: f.field,
                    value: f.value,
                    reason: f.reason,
                  ))
              .toList(),
        );
      } catch (_) {}
    }
    return switch (status) {
      401 => const UnauthorizedException(),
      403 => const ForbiddenException(),
      404 => const NotFoundException(),
      429 => const RateLimitException(),
      _ => ApiException('서버 오류 ($status)'),
    };
  }
  return switch (e.type) {
    DioExceptionType.connectionTimeout ||
    DioExceptionType.receiveTimeout =>
      const NetworkException(),
    _ => const NetworkException(),
  };
}
