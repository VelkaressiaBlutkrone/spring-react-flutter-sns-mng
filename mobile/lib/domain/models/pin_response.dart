/// doc/API_SPEC.md 6 — PinResponse
class PinResponse {
  const PinResponse({
    required this.id,
    required this.latitude,
    required this.longitude,
    required this.ownerId,
    this.ownerNickname,
    this.description,
    this.createdAt,
    this.updatedAt,
  });

  final int id;
  final double latitude;
  final double longitude;
  final int ownerId;
  final String? ownerNickname;
  final String? description;
  final String? createdAt;
  final String? updatedAt;

  /// 하위 호환용 별칭 (과거 필드명: memberId)
  int get memberId => ownerId;

  factory PinResponse.fromJson(Map<String, dynamic> json) {
    return PinResponse(
      id: json['id'] as int,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      ownerId: (json['ownerId'] ?? json['memberId']) as int,
      ownerNickname: json['ownerNickname'] as String?,
      description: json['description'] as String?,
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );
  }
}
