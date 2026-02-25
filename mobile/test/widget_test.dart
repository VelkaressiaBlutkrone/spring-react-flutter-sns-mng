import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile/main.dart';
import 'package:mobile/presentation/providers/auth_provider.dart';

class _TestAuthNotifier extends AuthNotifier {
  @override
  AuthState build() => const AuthUnauthenticated();
}

void main() {
  testWidgets('비로그인 상태에서는 지도 로딩 화면이 보인다', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authNotifierProvider.overrideWith(_TestAuthNotifier.new),
        ],
        child: const MyApp(),
      ),
    );
    await tester.pump();

    expect(find.widgetWithText(AppBar, '지도'), findsOneWidget);
    expect(find.text('현재 위치를 확인하고 있습니다.'), findsOneWidget);
  });
}
