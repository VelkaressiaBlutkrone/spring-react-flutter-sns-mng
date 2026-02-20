package com.example.sns.config.auth;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import com.example.sns.config.ratelimit.RateLimitProperties;
import com.example.sns.config.upload.UploadProperties;

/**
 * JWT 및 공통 Properties 설정 활성화.
 */
@Configuration
@EnableConfigurationProperties({
        JwtProperties.class,
        CorsProperties.class,
        UploadProperties.class,
        RateLimitProperties.class
})
public class JwtConfig {
}
