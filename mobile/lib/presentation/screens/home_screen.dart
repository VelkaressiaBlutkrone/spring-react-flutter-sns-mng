import 'package:flutter/material.dart';

/// 홈 화면 — Step 3 이후 구현
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Map SNS')),
      body: const Center(child: Text('TASK_MOBILE Step 2 완료')),
    );
  }
}
