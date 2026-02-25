// 게시글 상세 화면. TASK_MOBILE Step 5
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/common/app_error_view.dart';
import '../../../shared/widgets/common/loading_widget.dart';
import '../../providers/post_provider.dart';

/// 게시글 상세
class PostDetailScreen extends ConsumerWidget {
  const PostDetailScreen({super.key, required this.postId});

  final int postId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(postDetailProvider(postId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('게시글 상세'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: async.when(
        data: (post) => SingleChildScrollView(
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
        loading: () => const LoadingWidget(),
        error: (e, _) => AppErrorView(
          message: e.toString(),
          onRetry: () => ref.invalidate(postDetailProvider(postId)),
        ),
      ),
    );
  }
}
