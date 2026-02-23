/// doc/API_SPEC.md 7.4 — MemberUpdateRequest (nickname 등)
class MemberUpdateRequest {
  const MemberUpdateRequest({
    this.nickname,
  });

  final String? nickname;

  Map<String, dynamic> toJson() => {
        if (nickname != null) 'nickname': nickname,
      };
}
