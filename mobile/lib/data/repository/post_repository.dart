// 게시글 저장소. doc/API_SPEC.md 4, TASK_MOBILE Step 5
import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/error/exception_mapper.dart';
import '../../domain/models/models.dart';
import '../api/api_client.dart';

/// 게시글 저장소
class PostRepository {
  PostRepository({required ApiClient apiClient}) : _api = apiClient;

  final ApiClient _api;

  /// 게시글 목록: GET /api/posts (page, size, keyword)
  Future<PageResponse<PostResponse>> getList({
    int page = 0,
    int size = 20,
    String? keyword,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'size': size,
    };
    if (keyword != null && keyword.isNotEmpty) {
      queryParams['keyword'] = keyword;
    }
    try {
      final res = await _api.get(
        ApiConstants.posts,
        queryParameters: queryParams,
        options: Options(extra: {'skipAuth': true}),
      );
      return PageResponse.fromJson(
        res.data as Map<String, dynamic>,
        (json) => PostResponse.fromJson(Map<String, dynamic>.from(json)),
      );
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 게시글 상세: GET /api/posts/{id}
  Future<PostResponse> getById(int id) async {
    try {
      final res = await _api.get(
      '${ApiConstants.posts}/$id',
      options: Options(extra: {'skipAuth': true}),
    );
      return PostResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}
