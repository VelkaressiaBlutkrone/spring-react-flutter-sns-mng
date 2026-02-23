package com.example.sns.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * 로그인·토큰 갱신 응답 DTO.
 *
 * API 명세: accessToken, tokenType, expiresIn.
 * 모바일(X-Client: mobile): refreshToken 본문 포함 (RULE 6.1.6).
 */
public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        @JsonInclude(JsonInclude.Include.NON_NULL) String refreshToken
) {

    public static LoginResponse of(String accessToken, long expiresInSeconds) {
        return new LoginResponse(accessToken, "Bearer", expiresInSeconds, null);
    }

    /** 모바일용: Refresh Token 본문 포함 (쿠키 미지원 환경) */
    public static LoginResponse of(String accessToken, long expiresInSeconds, String refreshToken) {
        return new LoginResponse(accessToken, "Bearer", expiresInSeconds, refreshToken);
    }
}
