// RULE 6.1.6: flutter_secure_storage. RULE 1.1: 토큰 로그 금지.
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Access Token·Refresh Token 보안 저장소 (Keychain/Keystore)
class TokenStorage {
  TokenStorage({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage(
            aOptions: AndroidOptions(encryptedSharedPreferences: true));

  static const _keyAccessToken = 'access_token';
  static const _keyRefreshToken = 'refresh_token';

  final FlutterSecureStorage _storage;

  /// Access Token 조회
  Future<String?> getAccessToken() => _storage.read(key: _keyAccessToken);

  /// Refresh Token 조회
  Future<String?> getRefreshToken() => _storage.read(key: _keyRefreshToken);

  /// 토큰 저장 (로그인 후)
  Future<void> saveTokens({
    required String accessToken,
    String? refreshToken,
  }) async {
    await _storage.write(key: _keyAccessToken, value: accessToken);
    if (refreshToken != null) {
      await _storage.write(key: _keyRefreshToken, value: refreshToken);
    }
  }

  /// 토큰 삭제 (로그아웃)
  Future<void> clearTokens() async {
    await _storage.delete(key: _keyAccessToken);
    await _storage.delete(key: _keyRefreshToken);
  }

  /// 로그인 여부 (Access Token 존재)
  Future<bool> hasAccessToken() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
