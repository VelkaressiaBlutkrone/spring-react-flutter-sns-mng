// 게시글·이미지 게시글 목록 화면. TASK_MOBILE Step 5
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../shared/utils/url_helper.dart';
import '../../../domain/models/models.dart';
import '../../../shared/widgets/common/app_error_view.dart';
import '../../../shared/widgets/common/empty_widget.dart';
import '../../../shared/widgets/common/loading_widget.dart';
import '../../providers/auth_provider.dart';
import '../../providers/image_post_provider.dart';
import '../../providers/post_provider.dart';

/// 게시글·이미지 게시글 목록 (탭)
class PostsListScreen extends ConsumerStatefulWidget {
  const PostsListScreen({super.key});

  @override
  ConsumerState<PostsListScreen> createState() => _PostsListScreenState();
}

class _PostsListScreenState extends ConsumerState<PostsListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (mounted) {
        setState(() {});
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final isLoggedIn = authState is AuthAuthenticated;
    final isPostTab = _tabController.index == 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('게시글'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: '게시글'),
            Tab(text: '이미지 게시글'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _PostListTab(),
          _ImagePostListTab(),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          if (!isLoggedIn) {
            context.go(AppRoutes.login);
            return;
          }
          context.push(
            isPostTab ? AppRoutes.postCreate : AppRoutes.imagePostCreate,
          );
        },
        icon: const Icon(Icons.add),
        label: Text(isPostTab ? '게시글 작성' : '이미지 게시글 작성'),
      ),
    );
  }
}

class _PostListTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(postListProvider(const PostListParams()));

    return async.when(
      data: (page) => RefreshIndicator(
        onRefresh: () async =>
            ref.invalidate(postListProvider(const PostListParams())),
        child: page.content.isEmpty
            ? const EmptyWidget(message: '게시글이 없습니다.')
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: page.content.length,
                itemBuilder: (context, i) {
                  final post = page.content[i];
                  return _PostCard(
                    post: post,
                    onTap: () => context.push(AppRoutes.postDetailPath(post.id)),
                  );
                },
              ),
      ),
      loading: () => const LoadingWidget(),
      error: (e, _) => AppErrorView(
        message: e.toString(),
        onRetry: () => ref.invalidate(postListProvider(const PostListParams())),
      ),
    );
  }
}

class _PostCard extends StatelessWidget {
  const _PostCard({required this.post, required this.onTap});

  final PostResponse post;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(post.title),
        subtitle: Text(
          '${post.authorNickname} · ${post.createdAt}',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        onTap: onTap,
      ),
    );
  }
}

class _ImagePostListTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(imagePostListProvider(const ImagePostListParams()));

    return async.when(
      data: (page) => RefreshIndicator(
        onRefresh: () async =>
            ref.invalidate(imagePostListProvider(const ImagePostListParams())),
        child: page.content.isEmpty
            ? const EmptyWidget(message: '이미지 게시글이 없습니다.')
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: page.content.length,
                itemBuilder: (context, i) {
                  final post = page.content[i];
                  return _ImagePostCard(
                    post: post,
                    onTap: () => context.push(
                      AppRoutes.imagePostDetailPath(post.id),
                    ),
                  );
                },
              ),
      ),
      loading: () => const LoadingWidget(),
      error: (e, _) => AppErrorView(
        message: e.toString(),
        onRetry: () =>
            ref.invalidate(imagePostListProvider(const ImagePostListParams())),
      ),
    );
  }
}

class _ImagePostCard extends StatelessWidget {
  const _ImagePostCard({required this.post, required this.onTap});

  final ImagePostResponse post;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
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
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(post.title, style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 4),
                  Text(
                    '${post.authorNickname} · ${post.createdAt}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
