/// doc/API_SPEC.md 4 — PostResponse
class PostResponse {
  const PostResponse({
    required this.id,
    required this.title,
    required this.content,
    required this.authorId,
    required this.authorNickname,
    required this.createdAt,
    this.latitude,
    this.longitude,
    this.pinId,
  });

  final int id;
  final String title;
  final String content;
  final int authorId;
  final String authorNickname;
  final String createdAt;
  final double? latitude;
  final double? longitude;
  final int? pinId;

  factory PostResponse.fromJson(Map<String, dynamic> json) {
    return PostResponse(
      id: json['id'] as int,
      title: json['title'] as String,
      content: json['content'] as String,
      authorId: json['authorId'] as int,
      authorNickname: json['authorNickname'] as String,
      createdAt: json['createdAt'] as String,
      latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
      longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
      pinId: json['pinId'] as int?,
    );
  }
}
