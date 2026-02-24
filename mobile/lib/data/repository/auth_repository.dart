// 인증 저장소. doc/AUTH_DESIGN.md, doc/API_SPEC.md 3(인증)
import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/error/app_exception.dart';
import '../../core/logger/app_logger.dart';
import '../../domain/models/models.dart';
import '../api/api_client.dart';
import '../auth/token_storage.dart';

/// 인증 저장소
class AuthRepository {
  AuthRepository({
    required ApiClient apiClient,
    required TokenStorage tokenStorage,
  })  : _api = apiClient,
        _storage = tokenStorage;

  final ApiClient _api;
  final TokenStorage _storage;

  /// 로그인: POST /api/auth/login
  /// X-Client: mobile 헤더로 Refresh Token 본문 수신 (RULE 6.1.6)
  Future<LoginResponse> login(LoginRequest request) async {
    try {
      final res = await _api.post(
        ApiConstants.authLogin,
        data: request.toJson(),
        options: Options(
          headers: {'X-Client': 'mobile'},
          extra: {'skipAuth': true},
        ),
      );
      final loginRes = LoginResponse.fromJson(res.data as Map<String, dynamic>);
      final refreshToken = loginRes.refreshToken ??
          _parseRefreshTokenFromSetCookie(res);
      await _storage.saveTokens(
        accessToken: loginRes.accessToken,
        refreshToken: refreshToken,
      );
      return loginRes;
    } on DioException catch (e) {
      throw _mapDioException(e);
    }
  }

  String? _parseRefreshTokenFromSetCookie(Response res) {
    final setCookie = res.headers.value('set-cookie') ??
        res.headers.value('Set-Cookie');
    if (setCookie == null) return null;
    final match = RegExp(r'refreshToken=([^;]+)').firstMatch(setCookie);
    return match?.group(1)?.trim();
  }

  /// 토큰 갱신: POST /api/auth/refresh (Cookie: refreshToken)
  Future<LoginResponse> refreshToken() async {
    final refreshToken = await _storage.getRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      throw const UnauthorizedException('Refresh Token이 필요합니다.');
    }
    try {
      final res = await _api.post(
        ApiConstants.authRefresh,
        options: Options(
          headers: {'Cookie': 'refreshToken=$refreshToken'},
          extra: {'skipAuth': true},
        ),
      );
      final loginRes = LoginResponse.fromJson(res.data as Map<String, dynamic>);
      await _storage.saveTokens(
        accessToken: loginRes.accessToken,
        refreshToken: refreshToken,
      );
      return loginRes;
    } on DioException catch (e) {
      await _storage.clearTokens();
      throw _mapDioException(e);
    }
  }

  /// 로그아웃: POST /api/auth/logout
  Future<void> logout() async {
    try {
      await _api.post(ApiConstants.authLogout);
    } catch (e, st) {
      logDebug('AuthRepository', '로그아웃 API 실패 (로컬 토큰은 삭제됨)', e, st);
    } finally {
      await _storage.clearTokens();
    }
  }

  /// 현재 사용자: GET /api/auth/me
  /// 401·500·네트워크 오류 시 null (비로그인으로 처리)
  Future<MemberResponse?> getCurrentUser() async {
    try {
      final res = await _api.get(ApiConstants.authMe);
      return MemberResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      final status = e.response?.statusCode ?? 0;
      if (status == 401) return null;
      if (status >= 500) {
        logDebug('AuthRepository', 'getCurrentUser 5xx: $status', e);
        return null;
      }
      // 연결 오류(백엔드 미실행·CORS 등) 시 비로그인으로 처리
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        logDebug(
          'AuthRepository',
          'getCurrentUser 연결 오류: type=${e.type}, message=${e.message}',
          e,
        );
        return null;
      }
      logDebug('AuthRepository', 'getCurrentUser DioException', e);
      rethrow;
    } catch (e, st) {
      logDebug('AuthRepository', 'getCurrentUser 예외', e, st);
      return null;
    }
  }

  AppException _mapDioException(DioException e) {
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
        } catch (e) {
          logDebug('AuthRepository', 'ErrorResponse 파싱 실패', e);
        }
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
}
