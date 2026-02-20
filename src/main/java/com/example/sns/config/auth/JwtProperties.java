package com.example.sns.config.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * JWT 설정 속성.
 *
 * RULE 1.1: 비밀정보는 환경 변수로 주입.
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        @DefaultValue("15") int accessTtlMinutes,
        @DefaultValue("7") int refreshTtlDays,
        @DefaultValue("https://api.example.com") String issuer,
        @DefaultValue("spring-thymleaf-map-sns-mng") String audience,
        String secretKey
) {
}
