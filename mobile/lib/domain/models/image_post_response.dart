/// doc/API_SPEC.md 5 — ImagePostResponse
class ImagePostResponse {
  const ImagePostResponse({
    required this.id,
    required this.title,
    required this.content,
    required this.imageUrl,
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
  final String imageUrl;
  final int authorId;
  final String authorNickname;
  final String createdAt;
  final double? latitude;
  final double? longitude;
  final int? pinId;

  factory ImagePostResponse.fromJson(Map<String, dynamic> json) {
    return ImagePostResponse(
      id: json['id'] as int,
      title: json['title'] as String,
      content: json['content'] as String,
      imageUrl: json['imageUrl'] as String,
      authorId: json['authorId'] as int,
      authorNickname: json['authorNickname'] as String,
      createdAt: json['createdAt'] as String,
      latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
      longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
      pinId: json['pinId'] as int?,
    );
  }
}
