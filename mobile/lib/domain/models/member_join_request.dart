/// doc/API_SPEC.md 2.1 — MemberJoinRequest
class MemberJoinRequest {
  const MemberJoinRequest({
    required this.email,
    required this.password,
    required this.nickname,
  });

  final String email;
  final String password;
  final String nickname;

  Map<String, dynamic> toJson() => {
        'email': email,
        'password': password,
        'nickname': nickname,
      };
}
