/// doc/API_SPEC.md 9.1 — ErrorResponse
class ErrorResponse {
  const ErrorResponse({
    required this.code,
    required this.message,
    this.fieldErrors = const [],
  });

  final String code;
  final String message;
  final List<FieldError> fieldErrors;

  factory ErrorResponse.fromJson(Map<String, dynamic> json) {
    return ErrorResponse(
      code: json['code'] as String,
      message: json['message'] as String,
      fieldErrors: (json['fieldErrors'] as List<dynamic>?)
              ?.map((e) => FieldError.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class FieldError {
  const FieldError({
    required this.field,
    required this.value,
    required this.reason,
  });

  final String field;
  final String value;
  final String reason;

  factory FieldError.fromJson(Map<String, dynamic> json) {
    return FieldError(
      field: json['field'] as String,
      value: json['value'] as String,
      reason: json['reason'] as String,
    );
  }
}
