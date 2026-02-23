/// doc/API_SPEC.md 4.3 — PostCreateRequest
class PostCreateRequest {
  const PostCreateRequest({
    required this.title,
    required this.content,
    this.latitude,
    this.longitude,
    this.pinId,
  });

  final String title;
  final String content;
  final double? latitude;
  final double? longitude;
  final int? pinId;

  Map<String, dynamic> toJson() => {
        'title': title,
        'content': content,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        if (pinId != null) 'pinId': pinId,
      };
}
