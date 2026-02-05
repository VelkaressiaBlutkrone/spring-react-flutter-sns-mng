package com.example.sns.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;

import lombok.extern.slf4j.Slf4j;

/**
 * Redis 설정 및 연결 검증.
 *
 * RULE 1.4.3: Redis 연결·토큰 저장 성공/실패 시 파라미터화 로깅.
 * RULE 1.1: 비밀정보(비밀번호 등) 로그 출력 금지.
 */
@Slf4j
@Configuration
@Profile("!test")
public class RedisConfig {

    /**
     * 애플리케이션 기동 시 Redis 연결 상태를 검증하고 로깅한다.
     *
     * RULE 1.4.3: 파라미터화 로깅 사용, 비밀정보 제외.
     */
    @Bean
    public ApplicationRunner redisConnectionHealthLogger(StringRedisTemplate redisTemplate) {
        return args -> {
            try {
                String pong = redisTemplate.getConnectionFactory().getConnection().ping();
                log.info("Redis 연결 성공: pong={}", pong);
            } catch (Exception e) {
                log.error("Redis 연결 실패: {}", e.getMessage());
                throw e;
            }
        };
    }
}
