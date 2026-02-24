package com.example.sns;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

import com.example.sns.service.auth.NoOpTokenStore;
import com.example.sns.service.auth.TokenStore;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * 테스트용 설정.
 * NoOpTokenStore, ObjectMapper 등 테스트 시 누락되는 빈 제공.
 */
@TestConfiguration
@Profile("test")
public class TestConfig {

    @Bean
    public TokenStore tokenStore() {
        return new NoOpTokenStore();
    }

    /** SecurityConfig 등에서 사용. ErrorResponse.timestamp(Instant) 직렬화 지원. */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper().registerModule(new JavaTimeModule());
    }
}
