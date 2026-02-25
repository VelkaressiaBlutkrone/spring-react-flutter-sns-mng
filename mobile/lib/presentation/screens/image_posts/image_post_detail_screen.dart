// 이미지 게시글 상세 화면. TASK_MOBILE Step 5
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/utils/url_helper.dart';
import '../../../shared/widgets/common/app_error_view.dart';
import '../../../shared/widgets/common/loading_widget.dart';
import '../../providers/image_post_provider.dart';

/// 이미지 게시글 상세
class ImagePostDetailScreen extends ConsumerWidget {
  const ImagePostDetailScreen({super.key, required this.postId});

  final int postId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(imagePostDetailProvider(postId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('이미지 게시글 상세'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: async.when(
        data: (post) => SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AspectRatio(
                aspectRatio: 16 / 9,
                child: CachedNetworkImage(
                  imageUrl: toAbsoluteUrl(post.imageUrl),
                  fit: BoxFit.cover,
                  placeholder: (context, url) => const Center(
                    child: CircularProgressIndicator(),
                  ),
                  errorWidget: (context, url, error) =>
                      const Icon(Icons.broken_image, size: 48),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      post.title,
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${post.authorNickname} · ${post.createdAt}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(height: 16),
                    Text(post.content),
                    if (post.latitude != null && post.longitude != null) ...[
                      const SizedBox(height: 24),
                      ListTile(
                        leading: const Icon(Icons.location_on),
                        title: const Text('위치 정보'),
                        subtitle: Text(
                          '${post.latitude}, ${post.longitude}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        onTap: () {
                          // Step 6에서 지도 연동
                        },
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
        loading: () => const LoadingWidget(),
        error: (e, _) => AppErrorView(
          message: e.toString(),
          onRetry: () => ref.invalidate(imagePostDetailProvider(postId)),
        ),
      ),
    );
  }
}
