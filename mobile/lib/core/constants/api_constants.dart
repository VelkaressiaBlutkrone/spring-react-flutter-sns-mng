/// API 경로 상수 (doc/API_SPEC.md 기준).
class ApiConstants {
  ApiConstants._();

  static const String authLogin = '/api/auth/login';
  static const String authRefresh = '/api/auth/refresh';
  static const String authLogout = '/api/auth/logout';
  static const String authMe = '/api/auth/me';

  static const String members = '/api/members';

  static const String posts = '/api/posts';
  static const String postsNearby = '/api/posts/nearby';

  static const String imagePosts = '/api/image-posts';
  static const String imagePostsNearby = '/api/image-posts/nearby';

  static const String pins = '/api/pins';
  static const String pinsNearby = '/api/pins/nearby';

  static const String me = '/api/me';
  static const String mePosts = '/api/me/posts';
  static const String meImagePosts = '/api/me/image-posts';
  static const String mePins = '/api/me/pins';
}
