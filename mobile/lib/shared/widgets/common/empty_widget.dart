// 공통 빈 상태 위젯. TASK_MOBILE Step 4, RULE 7.3.6
import 'package:flutter/material.dart';

/// 데이터 없음 표시 위젯
class EmptyWidget extends StatelessWidget {
  const EmptyWidget({
    super.key,
    this.message = '표시할 내용이 없습니다.',
    this.icon,
  });

  /// 안내 메시지
  final String message;

  /// 아이콘 (기본: info_outline)
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon ?? Icons.info_outline,
              size: 48,
              color: Theme.of(context).colorScheme.outline,
            ),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
          ],
        ),
      ),
    );
  }
}
