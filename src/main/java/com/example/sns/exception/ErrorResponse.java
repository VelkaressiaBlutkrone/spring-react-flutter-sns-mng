package com.example.sns.exception;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.MDC;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.servlet.http.HttpServletRequest;

/**
 * 공통 에러 응답 (07-platform-spring 7.1.2).
 *
 * timestamp, path, traceId — 운영 환경 문제 추적용.
 * details — validation 오류 등 부가 정보 (Map).
 * fieldErrors — 프론트엔드 호환용 (validation 시에만 채움).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String code,
        String message,
        Instant timestamp,
        String path,
        String traceId,
        Map<String, Object> details,
        List<FieldError> fieldErrors
) {

    private static final String MDC_TRACE_ID = "traceId";

    public record FieldError(String field, String value, String reason) {
    }

    /** 단순 오류 (details·fieldErrors 없음) */
    public static ErrorResponse of(String code, String message, HttpServletRequest req) {
        return new ErrorResponse(
                code, message,
                Instant.now(),
                req != null ? req.getRequestURI() : null,
                MDC.get(MDC_TRACE_ID),
                Map.of(),
                null);
    }

    /** ErrorCode 기반 단순 오류 */
    public static ErrorResponse of(ErrorCode errorCode, HttpServletRequest req) {
        return of(errorCode.getCode(), errorCode.getDefaultMessage(), req);
    }

    /** ErrorCode + 커스텀 메시지 */
    public static ErrorResponse of(ErrorCode errorCode, String message, HttpServletRequest req) {
        return of(errorCode.getCode(), message != null ? message : errorCode.getDefaultMessage(), req);
    }

    /** Validation 오류 — details(Map) + fieldErrors(프론트엔드 호환) */
    public static ErrorResponse ofValidation(String message, Map<String, Object> details,
            List<FieldError> fieldErrors, HttpServletRequest req) {
        return new ErrorResponse(
                ErrorCode.VALIDATION_ERROR.getCode(),
                message,
                Instant.now(),
                req != null ? req.getRequestURI() : null,
                MDC.get(MDC_TRACE_ID),
                details != null ? details : Map.of(),
                fieldErrors);
    }

    /** MethodArgumentNotValidException / ConstraintViolationException용 — details + fieldErrors 생성 */
    public static ErrorResponse ofValidation(List<FieldError> fieldErrors, HttpServletRequest req) {
        Map<String, Object> details = fieldErrors.stream()
                .collect(Collectors.toMap(FieldError::field, fe -> fe.reason() != null ? fe.reason() : "invalid",
                        (a, b) -> a));
        String message = fieldErrors.stream()
                .map(fe -> fe.field() + ": " + (fe.reason() != null ? fe.reason() : "invalid"))
                .collect(Collectors.joining(", "));
        return ofValidation(message, details, fieldErrors, req);
    }

    /** HttpServletRequest 없음 시 (SecurityConfig 등) — path/traceId는 null 허용 */
    public static ErrorResponse of(ErrorCode errorCode) {
        return new ErrorResponse(
                errorCode.getCode(),
                errorCode.getDefaultMessage(),
                Instant.now(),
                null,
                MDC.get(MDC_TRACE_ID),
                Map.of(),
                null);
    }
}
