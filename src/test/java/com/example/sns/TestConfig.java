package com.example.sns;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

import com.example.sns.service.auth.NoOpTokenStore;
import com.example.sns.service.auth.TokenStore;
/**
 * 테스트용 설정.
 * NoOpTokenStore 등 테스트 시 누락되는 빈 제공.
 */
@TestConfiguration
@Profile("test")
public class TestConfig {

    @Bean
    public TokenStore tokenStore() {
        return new NoOpTokenStore();
    }
}
