/// doc/API_SPEC.md 6.3 — PinCreateRequest
class PinCreateRequest {
  const PinCreateRequest({
    required this.latitude,
    required this.longitude,
    this.description,
  });

  final double latitude;
  final double longitude;
  final String? description;

  Map<String, dynamic> toJson() => {
        'latitude': latitude,
        'longitude': longitude,
        if (description != null) 'description': description,
      };
}
