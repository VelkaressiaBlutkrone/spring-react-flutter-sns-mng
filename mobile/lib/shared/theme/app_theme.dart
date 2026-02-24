// 앱 테마. TASK_MOBILE Step 4, RULE 7.3.6
import 'package:flutter/material.dart';

/// 앱 테마 정의 (색상·Typography)
class AppTheme {
  AppTheme._();

  /// 시드 컬러
  static const Color _seedColor = Color(0xFF5C6BC0);

  /// 라이트 테마
  static ThemeData get light => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _seedColor,
          brightness: Brightness.light,
        ),
        typography: Typography.material2021(),
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 0,
        ),
      );

  /// 다크 테마
  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _seedColor,
          brightness: Brightness.dark,
        ),
        typography: Typography.material2021(),
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 0,
        ),
      );
}
