// 이미지 게시글 Provider. TASK_MOBILE Step 5, 07-platform-flutter 7.3.5
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/di/app_providers.dart';
import '../../domain/models/image_post_response.dart';
import '../../domain/models/page_response.dart';

/// 이미지 게시글 목록 Provider (페이징)
final imagePostListProvider =
    FutureProvider.family<PageResponse<ImagePostResponse>, ImagePostListParams>((ref, params) async {
  return imagePostRepository.getList(
    page: params.page,
    size: params.size,
    keyword: params.keyword,
  );
});

/// 이미지 게시글 목록 파라미터
class ImagePostListParams {
  const ImagePostListParams({this.page = 0, this.size = 20, this.keyword});

  final int page;
  final int size;
  final String? keyword;
}

/// 이미지 게시글 상세 Provider
final imagePostDetailProvider = FutureProvider.family<ImagePostResponse, int>((ref, id) async {
  return imagePostRepository.getById(id);
});
