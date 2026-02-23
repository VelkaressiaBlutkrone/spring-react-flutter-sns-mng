/// doc/API_SPEC.md 6.4 — PinUpdateRequest
class PinUpdateRequest {
  const PinUpdateRequest({
    this.latitude,
    this.longitude,
    this.description,
  });

  final double? latitude;
  final double? longitude;
  final String? description;

  Map<String, dynamic> toJson() => {
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        if (description != null) 'description': description,
      };
}
