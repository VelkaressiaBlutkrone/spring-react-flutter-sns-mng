// URL 헬퍼. TASK_MOBILE Step 5
import '../../core/config/app_config.dart';

/// 상대 경로를 절대 URL로 변환 (이미지 등)
String toAbsoluteUrl(String? path) {
  if (path == null || path.isEmpty) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  final base = AppConfig.apiBaseUrl.replaceAll(RegExp(r'/$'), '');
  final p = path.startsWith('/') ? path : '/$path';
  return '$base$p';
}
