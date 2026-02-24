// 디버그 로깅. RULE 7.3.2: kDebugMode 조건, 프로덕션 제거
import 'package:flutter/foundation.dart';

/// 디버그 빌드에서만 로그 출력. 프로덕션에서는 무시.
void logDebug(String tag, Object message, [Object? error, StackTrace? stackTrace]) {
  if (kDebugMode) {
    final buf = StringBuffer('[$tag] $message');
    if (error != null) buf.write(' | error=$error');
    debugPrint(buf.toString());
    if (stackTrace != null) debugPrint(stackTrace.toString());
  }
}
