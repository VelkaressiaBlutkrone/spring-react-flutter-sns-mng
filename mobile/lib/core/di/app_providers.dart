// 앱 전역 의존성 (Step 3에서 Riverpod으로 전환 예정). TASK_MOBILE Step 2.
import '../../data/api/api_client.dart';
import '../../data/auth/token_storage.dart';
import '../../data/repository/auth_repository.dart';

late final TokenStorage tokenStorage;
late final ApiClient apiClient;
late final AuthRepository authRepository;

/// DI 초기화 (main에서 호출)
void initAppProviders() {
  tokenStorage = TokenStorage();
  apiClient = ApiClient(tokenStorage: tokenStorage);
  authRepository = AuthRepository(
    apiClient: apiClient,
    tokenStorage: tokenStorage,
  );
}
