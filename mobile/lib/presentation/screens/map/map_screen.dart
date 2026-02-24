// 지도 화면 (플레이스홀더). TASK_MOBILE Step 4·6
// Step 6에서 지도 SDK 연동 예정
import 'package:flutter/material.dart';

import '../../../shared/widgets/common/empty_widget.dart';

/// 지도 메인 화면 (Step 6에서 구현)
class MapScreen extends StatelessWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('지도'),
      ),
      body: const EmptyWidget(
        message: '지도 기능은 Step 6에서 구현됩니다.',
        icon: Icons.map,
      ),
    );
  }
}
