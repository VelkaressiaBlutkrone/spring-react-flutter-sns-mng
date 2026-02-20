package com.example.sns.config.auth;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;

/**
 * CORS 설정 속성.
 *
 * RULE 1.2.3: 허용 오리진 최소화, * 금지.
 */
@Getter
@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

    /**
     * 허용 오리진 목록 (allow-list). * 사용 금지.
     * 환경 변수(CORS_ALLOWED_ORIGINS)로 주입 시 쉼표 구분 문자열 지원.
     */
    private List<String> allowedOrigins = List.of();

    /**
     * YAML 리스트 또는 환경 변수 바인딩용.
     */
    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins != null ? allowedOrigins : List.of();
    }

    /**
     * 단일 문자열(쉼표 구분) 지원. 환경 변수 "a,b,c" 형태.
     */
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
}
