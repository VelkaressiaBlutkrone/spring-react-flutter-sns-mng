package com.example.sns.service.auth;

import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * 테스트 환경용 TokenStore (Redis 미사용).
 *
 * Redis 제외 시 TokenStore 빈을 제공.
 */
@Component
@Profile("test")
public class NoOpTokenStore implements TokenStore {

    @Override
    public void saveRefreshToken(String jti, String payload, long ttlSeconds) {
    }

    @Override
    public Optional<String> getRefreshToken(String jti) {
        return Optional.empty();
    }

    @Override
    public void deleteRefreshToken(String jti) {
    }

    @Override
    public void addToBlacklist(String jti, long ttlSeconds) {
    }

    @Override
    public boolean isBlacklisted(String jti) {
        return false;
    }
}
