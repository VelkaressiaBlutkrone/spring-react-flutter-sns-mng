// 앱 전역 의존성. TASK_MOBILE Step 2·3·5
import '../../data/api/api_client.dart';
import '../../data/auth/token_storage.dart';
import '../../data/repository/auth_repository.dart';
import '../../data/repository/image_post_repository.dart';
import '../../data/repository/member_repository.dart';
import '../../data/repository/post_repository.dart';

late final TokenStorage tokenStorage;
late final ApiClient apiClient;
late final AuthRepository authRepository;
late final MemberRepository memberRepository;
late final PostRepository postRepository;
late final ImagePostRepository imagePostRepository;

/// DI 초기화 (main에서 호출)
void initAppProviders() {
  tokenStorage = TokenStorage();
  apiClient = ApiClient(tokenStorage: tokenStorage);
  authRepository = AuthRepository(
    apiClient: apiClient,
    tokenStorage: tokenStorage,
  );
  memberRepository = MemberRepository(apiClient: apiClient);
  postRepository = PostRepository(apiClient: apiClient);
  imagePostRepository = ImagePostRepository(apiClient: apiClient);
}
