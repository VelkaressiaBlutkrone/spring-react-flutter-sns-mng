package com.example.sns.config.auth;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;

/**
 * CORS 설정 속성.
 *
 * RULE 1.2.3: 허용 오리진 최소화. 프로덕션에서는 allowedOrigins만 사용.
 */
@Getter
@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

    /**
     * 허용 오리진 목록 (allow-list).
     * 환경 변수(CORS_ALLOWED_ORIGINS)로 주입 시 쉼표 구분 문자열 지원.
     */
    private List<String> allowedOrigins = List.of();

    /**
     * 오리진 패턴 (예: http://localhost:*) — 개발 환경에서 Flutter web 랜덤 포트 대응.
     * 설정 시 allowedOrigins 대신 사용.
     */
    private List<String> allowedOriginPatterns = List.of();

    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins != null ? allowedOrigins : List.of();
    }

    public void setAllowedOrigins(String value) {
        if (value == null || value.isBlank()) {
            this.allowedOrigins = List.of();
        } else {
            this.allowedOrigins = Arrays.stream(value.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
    }

    public void setAllowedOriginPatterns(List<String> allowedOriginPatterns) {
        this.allowedOriginPatterns = allowedOriginPatterns != null ? allowedOriginPatterns : List.of();
    }

    public void setAllowedOriginPatterns(String value) {
        if (value == null || value.isBlank()) {
            this.allowedOriginPatterns = List.of();
        } else {
            this.allowedOriginPatterns = Arrays.stream(value.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
    }
}
