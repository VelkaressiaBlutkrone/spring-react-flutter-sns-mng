// 폼 검증 유틸. RULE 1.3: 클라이언트 검증 + 서버 에러 표시
/// 이메일 형식 검증
bool isValidEmail(String value) {
  if (value.isEmpty) return false;
  final emailRegex = RegExp(
    r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
  );
  return emailRegex.hasMatch(value);
}

/// 비밀번호 8자 이상
bool isValidPassword(String value) {
  return value.length >= 8;
}

/// 닉네임 1자 이상
bool isValidNickname(String value) {
  return value.trim().isNotEmpty;
}
