// 앱 라우팅. TASK_MOBILE Step 4, 07-platform-flutter 7.3.12
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../presentation/providers/auth_provider.dart';
import '../../presentation/screens/auth/join_screen.dart';
import '../../presentation/screens/auth/login_screen.dart';
import '../../presentation/screens/main_tab_screen.dart';
import '../../features/map/presentation/screens/map_screen.dart';
import '../../presentation/screens/me/me_screen.dart';
import '../../presentation/screens/image_posts/image_post_detail_screen.dart';
import '../../presentation/screens/posts/post_detail_screen.dart';
import '../../presentation/screens/posts/posts_list_screen.dart';

part 'app_router.g.dart';

/// 라우트 경로 상수
abstract class AppRoutes {
  static const String login = '/login';
  static const String join = '/join';
  static const String home = '/';
  static const String map = '/map';
  static const String posts = '/posts';
  static const String postDetail = '/posts/:id';
  static const String imagePosts = '/image-posts';
  static const String imagePostDetail = '/image-posts/:id';
  static const String me = '/me';
}

/// GoRouter Provider (인증 상태에 따른 redirect)
// RULE 7.3.5: @riverpod 어노테이션으로 Provider 정의
@Riverpod(keepAlive: true)
GoRouter appRouter(Ref ref) {
  final authState = ref.watch(authNotifierProvider);

  return GoRouter(
    initialLocation: AppRoutes.home,
    redirect: (context, state) {
      final isLoggedIn = authState is AuthAuthenticated;
      final path = state.matchedLocation;
      final isAuthRoute = path == AppRoutes.login || path == AppRoutes.join;

      // 비로그인 시 인증 필요 화면 접근 → 로그인으로
      if (!isLoggedIn && (path == AppRoutes.me || path.startsWith('/me'))) {
        return AppRoutes.login;
      }

      // 로그인 상태에서 로그인/회원가입 접근 → 홈으로
      if (isLoggedIn && isAuthRoute) {
        return AppRoutes.home;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.join,
        builder: (context, state) => const JoinScreen(),
      ),
      GoRoute(
        path: '/posts/:id',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return PostDetailScreen(postId: id);
        },
      ),
      GoRoute(
        path: '/image-posts/:id',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return ImagePostDetailScreen(postId: id);
        },
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) =>
            MainTabScreen(navigationShell: shell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.home,
                builder: (context, state) => const MapScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.posts,
                builder: (context, state) => const PostsListScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.me,
                builder: (context, state) => const MeScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}
