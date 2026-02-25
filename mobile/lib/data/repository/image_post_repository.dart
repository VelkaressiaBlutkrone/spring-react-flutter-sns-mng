// 이미지 게시글 저장소. doc/API_SPEC.md 5, TASK_MOBILE Step 5
import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/error/exception_mapper.dart';
import '../../domain/models/image_post_response.dart';
import '../../domain/models/page_response.dart';
import '../api/api_client.dart';

/// 이미지 게시글 저장소
class ImagePostRepository {
  ImagePostRepository({required ApiClient apiClient}) : _api = apiClient;

  final ApiClient _api;

  /// 이미지 게시글 목록: GET /api/image-posts (page, size, keyword)
  Future<PageResponse<ImagePostResponse>> getList({
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
        ApiConstants.imagePosts,
        queryParameters: queryParams,
        options: Options(extra: {'skipAuth': true}),
      );
      return PageResponse.fromJson(
        res.data as Map<String, dynamic>,
        (json) => ImagePostResponse.fromJson(Map<String, dynamic>.from(json)),
      );
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 이미지 게시글 상세: GET /api/image-posts/{id}
  Future<ImagePostResponse> getById(int id) async {
    try {
      final res = await _api.get(
        '${ApiConstants.imagePosts}/$id',
        options: Options(extra: {'skipAuth': true}),
      );
      return ImagePostResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 반경 내 이미지 게시글 목록: GET /api/image-posts/nearby
  Future<PageResponse<ImagePostResponse>> getNearby({
    required double lat,
    required double lng,
    required double radiusKm,
    int page = 0,
    int size = 20,
  }) async {
    try {
      final res = await _api.get(
        ApiConstants.imagePostsNearby,
        queryParameters: {
          'lat': lat,
          'lng': lng,
          'radiusKm': radiusKm,
          'page': page,
          'size': size,
        },
        options: Options(extra: {'skipAuth': true}),
      );
      return PageResponse.fromJson(
        res.data as Map<String, dynamic>,
        (json) => ImagePostResponse.fromJson(Map<String, dynamic>.from(json)),
      );
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// Pin별 이미지 게시글 목록: GET /api/pins/{id}/image-posts
  Future<PageResponse<ImagePostResponse>> getByPinId(
    int pinId, {
    int page = 0,
    int size = 20,
  }) async {
    try {
      final res = await _api.get(
        '${ApiConstants.pins}/$pinId/image-posts',
        queryParameters: {
          'page': page,
          'size': size,
        },
        options: Options(extra: {'skipAuth': true}),
      );
      return PageResponse.fromJson(
        res.data as Map<String, dynamic>,
        (json) => ImagePostResponse.fromJson(Map<String, dynamic>.from(json)),
      );
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}
