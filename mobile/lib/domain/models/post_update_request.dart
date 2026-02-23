/// doc/API_SPEC.md 4.4 — PostUpdateRequest
class PostUpdateRequest {
  const PostUpdateRequest({
    this.title,
    this.content,
    this.latitude,
    this.longitude,
    this.pinId,
  });

  final String? title;
  final String? content;
  final double? latitude;
  final double? longitude;
  final int? pinId;

  Map<String, dynamic> toJson() => {
        if (title != null) 'title': title,
        if (content != null) 'content': content,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        if (pinId != null) 'pinId': pinId,
      };
}
