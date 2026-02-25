// 인증 상태 관리. 07-platform-flutter 7.3.5, TASK_MOBILE Step 3
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../core/di/app_providers.dart';
import '../../data/repository/auth_repository.dart';
import '../../domain/models/models.dart';

part 'auth_provider.g.dart';

/// 인증 상태
sealed class AuthState {
  const AuthState();
}

/// 초기 (토큰 확인 전)
class AuthInitial extends AuthState {
  const AuthInitial();
}

/// 확인 중
class AuthLoading extends AuthState {
  const AuthLoading();
}

/// 로그인됨
class AuthAuthenticated extends AuthState {
  const AuthAuthenticated(this.member);
  final MemberResponse member;
}

/// 비로그인
class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated();
}

/// 인증 상태 Notifier
// RULE 7.3.5: @riverpod 어노테이션으로 Notifier 정의
@Riverpod(keepAlive: true)
class AuthNotifier extends _$AuthNotifier {
  late final AuthRepository _authRepository;

  @override
  AuthState build() {
    // build 메소드에서 의존성을 초기화하고, 동기적으로 초기 상태를 반환합니다.
    // 실제 인증 확인은 별도의 메소드로 호출합니다.
    _authRepository = authRepository;
    _checkAuth();
    return const AuthInitial();
  }

  /// 앱 시작 시 토큰 확인
  Future<void> _checkAuth() async {
    state = const AuthLoading();
    final member = await _authRepository.getCurrentUser();
    state = member != null
        ? AuthAuthenticated(member)
        : const AuthUnauthenticated();
  }

  /// 로그인
  Future<void> login(String email, String password) async {
    state = const AuthLoading();
    try {
      await _authRepository.login(LoginRequest(email: email, password: password));
      final user = await _authRepository.getCurrentUser();
      state = user != null
          ? AuthAuthenticated(user)
          : const AuthUnauthenticated();
    } catch (_) {
      state = const AuthUnauthenticated();
      rethrow;
    }
  }

  /// 로그아웃
  Future<void> logout() async {
    state = const AuthLoading();
    await _authRepository.logout();
    state = const AuthUnauthenticated();
  }

  /// 현재 사용자 갱신 (로그인 후)
  Future<void> refreshUser() async {
    final member = await _authRepository.getCurrentUser();
    if (member != null) {
      state = AuthAuthenticated(member);
    }
  }
}
