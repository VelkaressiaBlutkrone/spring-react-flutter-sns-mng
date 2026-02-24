// 앱 진입점. TASK_MOBILE Step 4
import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/di/app_providers.dart';
import 'core/logger/app_logger.dart';
import 'core/router/app_router.dart';
import 'shared/theme/app_theme.dart';

void main() {
  initAppProviders();
  if (kDebugMode) {
    // 미처리 비동기 예외 로깅 (디버깅용)
    runZonedGuarded(() {
      runApp(
        const ProviderScope(
          child: MyApp(),
        ),
      );
    }, (error, stackTrace) {
      logDebug('main', '미처리 예외', error, stackTrace);
    });
  } else {
    runApp(
      const ProviderScope(
        child: MyApp(),
      ),
    );
  }
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'Map SNS',
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      routerConfig: router,
    );
  }
}
