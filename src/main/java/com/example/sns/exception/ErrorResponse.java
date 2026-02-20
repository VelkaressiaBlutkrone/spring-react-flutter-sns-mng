package com.example.sns.exception;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * API 에러 응답 DTO.
 *
 * GlobalExceptionHandler에서 일관된 형식으로 반환 (RULE 2.2.3).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String code,
        String message,
        List<FieldError> fieldErrors
) {

    public record FieldError(String field, String value, String reason) {
    }

    public static ErrorResponse of(ErrorCode errorCode) {
        return new ErrorResponse(errorCode.getCode(), errorCode.getDefaultMessage(), null);
    }

    public static ErrorResponse of(ErrorCode errorCode, String message) {
        return new ErrorResponse(errorCode.getCode(), message != null ? message : errorCode.getDefaultMessage(), null);
    }

    public static ErrorResponse of(ErrorCode errorCode, List<FieldError> fieldErrors) {
        return new ErrorResponse(errorCode.getCode(), errorCode.getDefaultMessage(), fieldErrors);
    }
}
