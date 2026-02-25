import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile/main.dart';
import 'package:mobile/presentation/providers/auth_provider.dart';

class _TestAuthNotifier extends AuthNotifier {
  @override
  AuthState build() => const AuthUnauthenticated();
}

void main() {
  testWidgets('비로그인 상태에서는 로그인 화면이 보인다', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authNotifierProvider.overrideWith(_TestAuthNotifier.new),
        ],
        child: const MyApp(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('로그인'), findsWidgets);
    expect(find.text('회원가입'), findsOneWidget);
    expect(find.text('이메일'), findsOneWidget);
  });
}
