package com.example.sns.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * JWT 설정 활성화.
 */
@Configuration
@EnableConfigurationProperties({ JwtProperties.class, CorsProperties.class, UploadProperties.class,
        RateLimitProperties.class })
public class JwtConfig {
}
