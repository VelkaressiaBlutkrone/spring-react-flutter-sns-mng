// 마이페이지 화면. TASK_MOBILE Step 4·9
// Step 9에서 상세 구현 예정
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../../core/router/app_router.dart';

/// 마이페이지 (인증 필요)
class MeScreen extends ConsumerWidget {
  const MeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);
    final member = authState is AuthAuthenticated ? authState.member : null;

    if (member == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('마이페이지')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('마이페이지'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authNotifierProvider.notifier).logout();
              if (context.mounted) context.go(AppRoutes.login);
            },
            tooltip: '로그아웃',
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('안녕하세요, ${member.nickname}님'),
            const SizedBox(height: 8),
            Text(
              member.email,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 24),
            Text(
              '마이페이지 상세는 Step 9에서 구현됩니다.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
