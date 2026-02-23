/// doc/API_SPEC.md 6 — PinResponse
class PinResponse {
  const PinResponse({
    required this.id,
    required this.latitude,
    required this.longitude,
    required this.memberId,
    this.description,
    this.createdAt,
  });

  final int id;
  final double latitude;
  final double longitude;
  final int memberId;
  final String? description;
  final String? createdAt;

  factory PinResponse.fromJson(Map<String, dynamic> json) {
    return PinResponse(
      id: json['id'] as int,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      memberId: json['memberId'] as int,
      description: json['description'] as String?,
      createdAt: json['createdAt'] as String?,
    );
  }
}
