package com.example.sns.service.auth;

import java.time.Duration;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Redis 기반 TokenStore 구현.
 *
 * RULE 6.1.7(Revocation), 6.5(Refresh Token Redis) 준수.
 * 키 패턴: refresh:{jti}, blacklist:{jti}
 */
@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class RedisTokenStore implements TokenStore {

    private static final String REFRESH_KEY_PREFIX = "refresh:";
    private static final String BLACKLIST_KEY_PREFIX = "blacklist:";

    private final StringRedisTemplate redisTemplate;

    @Override
    public void saveRefreshToken(String jti, String payload, long ttlSeconds) {
        String key = REFRESH_KEY_PREFIX + jti;
        try {
            Duration ttl = Duration.ofSeconds(ttlSeconds);
            redisTemplate.opsForValue().set(key, payload, ttl);
            log.debug("Refresh Token 저장 성공: jti={}, ttlSeconds={}", jti, ttlSeconds);
        } catch (Exception e) {
            log.error("Refresh Token 저장 실패: jti={}, error={}", jti, e.getMessage());
            throw e;
        }
    }

    @Override
    public Optional<String> getRefreshToken(String jti) {
        String key = REFRESH_KEY_PREFIX + jti;
        try {
            String value = redisTemplate.opsForValue().get(key);
            return Optional.ofNullable(value);
        } catch (Exception e) {
            log.error("Refresh Token 조회 실패: jti={}, error={}", jti, e.getMessage());
            throw e;
        }
    }

    @Override
    public void deleteRefreshToken(String jti) {
        String key = REFRESH_KEY_PREFIX + jti;
        try {
            Boolean deleted = redisTemplate.delete(key);
            log.debug("Refresh Token 삭제: jti={}, deleted={}", jti, Boolean.TRUE.equals(deleted));
        } catch (Exception e) {
            log.error("Refresh Token 삭제 실패: jti={}, error={}", jti, e.getMessage());
            throw e;
        }
    }

    @Override
    public void addToBlacklist(String jti, long ttlSeconds) {
        String key = BLACKLIST_KEY_PREFIX + jti;
        try {
            Duration ttl = Duration.ofSeconds(ttlSeconds);
            redisTemplate.opsForValue().set(key, "1", ttl);
            log.debug("블랙리스트 등록: jti={}, ttlSeconds={}", jti, ttlSeconds);
        } catch (Exception e) {
            log.error("블랙리스트 등록 실패: jti={}, error={}", jti, e.getMessage());
            throw e;
        }
    }

    @Override
    public boolean isBlacklisted(String jti) {
        String key = BLACKLIST_KEY_PREFIX + jti;
        try {
            Boolean hasKey = redisTemplate.hasKey(key);
            return Boolean.TRUE.equals(hasKey);
        } catch (Exception e) {
            log.error("블랙리스트 조회 실패: jti={}, error={}", jti, e.getMessage());
            throw e;
        }
    }
}
