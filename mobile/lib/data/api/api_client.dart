// Dio 기반 HTTP 클라이언트. RULE 7.3.3: Bearer·401 Refresh.
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../core/config/app_config.dart';
import '../../core/constants/api_constants.dart';
import '../../core/logger/app_logger.dart';
import '../auth/token_storage.dart';

/// API 클라이언트 (Dio 싱글톤)
class ApiClient {
  ApiClient({TokenStorage? tokenStorage})
      : _storage = tokenStorage ?? TokenStorage(),
        _dio = Dio(BaseOptions(
          baseUrl: AppConfig.apiBaseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        )) {
    final interceptors = <Interceptor>[
      _AuthInterceptor(_storage),
      _RefreshInterceptor(_dio, _storage),
    ];
    if (kDebugMode) {
      interceptors.insert(
        0,
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          logPrint: (obj) => logDebug('Dio', obj.toString()),
        ),
      );
    }
    _dio.interceptors.addAll(interceptors);
  }

  final TokenStorage _storage;
  final Dio _dio;

  /// GET 요청
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) =>
      _dio.get<T>(path, queryParameters: queryParameters, options: options);

  /// POST 요청
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Options? options,
  }) =>
      _dio.post<T>(path, data: data, options: options);

  /// PUT 요청
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Options? options,
  }) =>
      _dio.put<T>(path, data: data, options: options);

  /// DELETE 요청
  Future<Response<T>> delete<T>(String path, {Options? options}) =>
      _dio.delete<T>(path, options: options);

  /// Refresh 시 사용할 Dio (인터셉터 순환 방지용)
  Dio get dio => _dio;
}

/// Bearer 토큰 자동 주입 (skipAuth: true 시 생략)
class _AuthInterceptor extends Interceptor {
  _AuthInterceptor(this._storage);

  final TokenStorage _storage;

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) {
    if (options.extra['skipAuth'] == true) {
      return handler.next(options);
    }
    _injectToken(options).then((_) => handler.next(options)).catchError((e) {
      handler.reject(DioException(requestOptions: options, error: e));
    });
  }

  Future<void> _injectToken(RequestOptions options) async {
    final token = await _storage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
  }
}

/// 401 시 Refresh Token으로 갱신 후 재시도
class _RefreshInterceptor extends QueuedInterceptor {
  _RefreshInterceptor(this._dio, this._storage);

  final Dio _dio;
  final TokenStorage _storage;

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode != 401) {
      return handler.next(err);
    }
    if (err.requestOptions.extra['skipAuth'] == true) {
      return handler.next(err);
    }
    final refreshed = await _refreshToken();
    if (!refreshed) {
      return handler.next(err);
    }
    try {
      final opts = err.requestOptions;
      opts.extra.remove('skipAuth');
      final res = await _dio.fetch(opts);
      return handler.resolve(res);
    } catch (e) {
      return handler.next(err);
    }
  }

  Future<bool> _refreshToken() async {
    final refreshToken = await _storage.getRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) return false;
    try {
      final res = await _dio.post(
        ApiConstants.authRefresh,
        options: Options(
          headers: {'Cookie': 'refreshToken=$refreshToken'},
          extra: {'skipAuth': true},
        ),
      );
      final newAccess = res.data['accessToken'] as String?;
      if (newAccess != null) {
        await _storage.saveTokens(
          accessToken: newAccess,
          refreshToken: refreshToken,
        );
        return true;
      }
    } catch (e, st) {
      logDebug('ApiClient', 'Refresh token 실패', e, st);
    }
    return false;
  }
}
