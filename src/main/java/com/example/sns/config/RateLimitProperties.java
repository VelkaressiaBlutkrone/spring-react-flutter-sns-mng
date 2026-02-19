package com.example.sns.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

/**
 * Rate Limiting 설정 속성.
 *
 * RULE 1.9, Step 18: 로그인·회원가입·토큰 갱신 등 공개 API Rate Limiting.
 * 수치는 트래픽 분석 후 조정 권장.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "app.rate-limit")
public class RateLimitProperties {

    /** 로그인 API: 분당 최대 요청 수 (IP 기준). */
    private int loginCapacity = 10;
    /** 로그인 API: 제한 주기(분). */
    private int loginPeriodMinutes = 1;

    /** 회원가입 API: 분당 최대 요청 수 (IP 기준). */
    private int signupCapacity = 10;
    /** 회원가입 API: 제한 주기(분). */
    private int signupPeriodMinutes = 1;

    /** 토큰 갱신 API: 5분당 최대 요청 수 (IP 기준). */
    private int refreshCapacity = 20;
    /** 토큰 갱신 API: 제한 주기(분). */
    private int refreshPeriodMinutes = 5;

    /** 비인증 공개 API: 분당 최대 요청 수 (IP 기준). RULE 1.9.2. */
    private int publicApiCapacity = 100;
    /** 비인증 공개 API: 제한 주기(분). */
    private int publicApiPeriodMinutes = 1;
}
