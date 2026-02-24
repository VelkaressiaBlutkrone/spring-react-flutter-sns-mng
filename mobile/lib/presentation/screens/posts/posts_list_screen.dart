// 게시글 목록 화면 (플레이스홀더). TASK_MOBILE Step 4·5
// Step 5에서 API 연동 예정
import 'package:flutter/material.dart';

import '../../../shared/widgets/common/empty_widget.dart';

/// 게시글 목록 화면 (Step 5에서 구현)
class PostsListScreen extends StatelessWidget {
  const PostsListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('게시글'),
      ),
      body: const EmptyWidget(
        message: '게시글 목록은 Step 5에서 구현됩니다.',
        icon: Icons.article,
      ),
    );
  }
}
