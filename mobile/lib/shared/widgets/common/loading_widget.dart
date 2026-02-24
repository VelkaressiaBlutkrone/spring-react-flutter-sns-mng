// 공통 로딩 위젯. TASK_MOBILE Step 4, RULE 7.3.6
import 'package:flutter/material.dart';

/// 전체 화면 로딩 인디케이터
class LoadingWidget extends StatelessWidget {
  const LoadingWidget({super.key, this.message});

  /// 로딩 메시지 (선택)
  final String? message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          if (message != null && message!.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              message!,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ],
      ),
    );
  }
}
