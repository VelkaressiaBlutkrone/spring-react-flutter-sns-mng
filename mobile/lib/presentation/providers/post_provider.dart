// 게시글 Provider. TASK_MOBILE Step 5, 07-platform-flutter 7.3.5
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/di/app_providers.dart';
import '../../domain/models/models.dart';

/// 게시글 목록 Provider (페이징)
final postListProvider = FutureProvider.family<PageResponse<PostResponse>, PostListParams>((ref, params) async {
  return postRepository.getList(
    page: params.page,
    size: params.size,
    keyword: params.keyword,
  );
});

/// 게시글 목록 파라미터
class PostListParams {
  const PostListParams({this.page = 0, this.size = 20, this.keyword});

  final int page;
  final int size;
  final String? keyword;
}

/// 게시글 상세 Provider
final postDetailProvider = FutureProvider.family<PostResponse, int>((ref, id) async {
  return postRepository.getById(id);
});
