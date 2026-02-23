/// doc/API_SPEC.md 2.1, 3.4 — MemberResponse
class MemberResponse {
  const MemberResponse({
    required this.id,
    required this.email,
    required this.nickname,
    required this.role,
    required this.createdAt,
  });

  final int id;
  final String email;
  final String nickname;
  final String role;
  final String createdAt;

  factory MemberResponse.fromJson(Map<String, dynamic> json) {
    return MemberResponse(
      id: json['id'] as int,
      email: json['email'] as String,
      nickname: json['nickname'] as String,
      role: json['role'] as String,
      createdAt: json['createdAt'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'nickname': nickname,
        'role': role,
        'createdAt': createdAt,
      };
}
