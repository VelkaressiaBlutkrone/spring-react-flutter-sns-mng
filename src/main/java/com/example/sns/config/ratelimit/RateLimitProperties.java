package com.example.sns.config.ratelimit;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Rate Limiting 설정 속성.
 *
 * RULE 1.9, Step 18: 로그인·회원가입·토큰 갱신 등 공개 API Rate Limiting.
 * 수치는 트래픽 분석 후 조정 권장.
 */
@ConfigurationProperties(prefix = "app.rate-limit")
public record RateLimitProperties(
        @DefaultValue("10") int loginCapacity,
        @DefaultValue("1") int loginPeriodMinutes,
        @DefaultValue("10") int signupCapacity,
        @DefaultValue("1") int signupPeriodMinutes,
        @DefaultValue("20") int refreshCapacity,
        @DefaultValue("5") int refreshPeriodMinutes,
        @DefaultValue("100") int publicApiCapacity,
        @DefaultValue("1") int publicApiPeriodMinutes
) {
}
