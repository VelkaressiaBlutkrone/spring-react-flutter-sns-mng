package com.example.sns.service.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

/**
 * RedisTokenStore 통합 테스트 (Testcontainers).
 *
 * Step 5 Done When: Refresh Token 저장·블랙리스트 조회 가능 검증.
 * RULE 4.2.2: Given-When-Then, AssertJ 준수.
 *
 * 실행: ./gradlew integrationTest (Docker 필요)
 */
@Tag("integration")
@Testcontainers
@SpringBootTest
@ActiveProfiles("local")
@DisplayName("RedisTokenStore 통합 테스트")
class RedisTokenStoreIntegrationTest {

    @Container
    static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void redisProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379).toString());
        registry.add("spring.data.redis.password", () -> "");
    }

    @Autowired
    private TokenStore tokenStore;

    @Test
    @DisplayName("Refresh Token 저장 후 조회 시 payload를 반환한다")
    void saveRefreshToken_저장후_조회시_payload를_반환한다() {
        // given
        String jti = "integration-jti-001";
        String payload = "100:USER";
        long ttlSeconds = 60L;

        // when
        tokenStore.saveRefreshToken(jti, payload, ttlSeconds);
        var result = tokenStore.getRefreshToken(jti);

        // then
        assertThat(result).isPresent().contains(payload);
    }

    @Test
    @DisplayName("Refresh Token 삭제 후 조회 시 empty를 반환한다")
    void deleteRefreshToken_삭제후_조회시_empty를_반환한다() {
        // given
        String jti = "integration-jti-002";
        tokenStore.saveRefreshToken(jti, "1:USER", 60L);

        // when
        tokenStore.deleteRefreshToken(jti);
        var result = tokenStore.getRefreshToken(jti);

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("블랙리스트 등록 후 isBlacklisted가 true를 반환한다")
    void addToBlacklist_등록후_isBlacklisted가_true를_반환한다() {
        // given
        String jti = "integration-jti-003";
        long ttlSeconds = 60L;

        // when
        tokenStore.addToBlacklist(jti, ttlSeconds);
        boolean result = tokenStore.isBlacklisted(jti);

        // then
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("블랙리스트에 없는 jti는 isBlacklisted가 false를 반환한다")
    void isBlacklisted_없는_jti는_false를_반환한다() {
        // given
        String jti = "integration-jti-unknown";

        // when
        boolean result = tokenStore.isBlacklisted(jti);

        // then
        assertThat(result).isFalse();
    }
}
