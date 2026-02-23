package com.example.sns.exception;

import java.util.List;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;

/**
 * 전역 예외 처리기 (07-platform-spring 7.1.2).
 *
 * 모든 예외를 일관된 ErrorResponse로 변환 (RULE 2.2.3).
 * timestamp, path, traceId 포함 — 운영 환경 문제 추적.
 * 스택 트레이스 사용자 반환 금지 (RULE 1.4.1).
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e, HttpServletRequest req) {
        if (e.getErrorCode() == ErrorCode.UNAUTHORIZED && "Refresh Token이 필요합니다.".equals(e.getMessage())) {
            log.debug("BusinessException: code={}, message={}", e.getErrorCode().getCode(), e.getMessage());
        } else {
            log.warn("BusinessException: code={}, message={}", e.getErrorCode().getCode(), e.getMessage());
        }
        ErrorResponse response = ErrorResponse.of(e.getErrorCode(), e.getMessage(), req);
        return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException e,
            HttpServletRequest req) {
        List<ErrorResponse.FieldError> fieldErrors = e.getBindingResult().getFieldErrors().stream()
                .map(err -> new ErrorResponse.FieldError(
                        err.getField(),
                        err.getRejectedValue() != null ? err.getRejectedValue().toString() : null,
                        err.getDefaultMessage()))
                .toList();
        log.warn("Validation failed: {}", fieldErrors);
        ErrorResponse response = ErrorResponse.ofValidation(fieldErrors, req);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponse> handleBindException(BindException e, HttpServletRequest req) {
        List<ErrorResponse.FieldError> fieldErrors = e.getBindingResult().getFieldErrors().stream()
                .map(err -> new ErrorResponse.FieldError(
                        err.getField(),
                        err.getRejectedValue() != null ? err.getRejectedValue().toString() : null,
                        err.getDefaultMessage()))
                .toList();
        log.warn("Bind validation failed: {}", fieldErrors);
        ErrorResponse response = ErrorResponse.ofValidation(fieldErrors, req);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException e,
            HttpServletRequest req) {
        List<ErrorResponse.FieldError> fieldErrors = e.getConstraintViolations().stream()
                .map(v -> new ErrorResponse.FieldError(
                        v.getPropertyPath().toString(),
                        v.getInvalidValue() != null ? v.getInvalidValue().toString() : null,
                        v.getMessage()))
                .toList();
        log.warn("Constraint violation: {}", fieldErrors);
        ErrorResponse response = ErrorResponse.ofValidation(fieldErrors, req);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException e, HttpServletRequest req) {
        log.warn("Entity not found: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.NOT_FOUND, e.getMessage(), req);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(MissingServletRequestParameterException e,
            HttpServletRequest req) {
        log.warn("Missing parameter: {}", e.getParameterName());
        ErrorResponse response = ErrorResponse.of(ErrorCode.BAD_REQUEST,
                "필수 파라미터가 누락되었습니다: " + e.getParameterName(), req);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException e,
            HttpServletRequest req) {
        log.warn("Type mismatch: {} for {}", e.getValue(), e.getName());
        ErrorResponse response = ErrorResponse.of(ErrorCode.BAD_REQUEST,
                "파라미터 형식이 올바르지 않습니다: " + e.getName(), req);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException e,
            HttpServletRequest req) {
        log.warn("Authentication failed: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.UNAUTHORIZED, req);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException e, HttpServletRequest req) {
        log.warn("Access denied: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.FORBIDDEN, req);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Void> handleNoResourceFound(NoResourceFoundException e) {
        log.debug("No static resource: {}", e.getResourcePath());
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccessException(DataAccessException e, HttpServletRequest req) {
        log.error("DataAccessException: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.SERVICE_UNAVAILABLE, req);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e, HttpServletRequest req) {
        log.error("[GlobalExceptionHandler] 예측 불가 예외: path={}", req != null ? req.getRequestURI() : "unknown", e);
        ErrorResponse response = ErrorResponse.of(ErrorCode.INTERNAL_SERVER_ERROR, req);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
