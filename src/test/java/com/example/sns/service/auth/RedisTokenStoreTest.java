package com.example.sns.service.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import java.time.Duration;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.ValueOperations;

/**
 * RedisTokenStore 단위 테스트.
 *
 * RULE 4.2.2: Given-When-Then, AssertJ, BDDMockito 준수.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("RedisTokenStore 단위 테스트")
class RedisTokenStoreTest {

    @Mock
    private org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOps;

    @InjectMocks
    private RedisTokenStore tokenStore;

    @Test
    @DisplayName("saveRefreshToken - jti로 Redis에 저장한다")
    void saveRefreshToken_jti로_Redis에_저장한다() {
        // given
        String jti = "jti-123";
        String payload = "1:USER";
        long ttlSeconds = 604800L; // 7일

        given(redisTemplate.opsForValue()).willReturn(valueOps);

        // when
        tokenStore.saveRefreshToken(jti, payload, ttlSeconds);

        // then
        verify(valueOps).set(eq("refresh:jti-123"), eq(payload), eq(Duration.ofSeconds(ttlSeconds)));
    }

    @Test
    @DisplayName("getRefreshToken - 존재하는 jti면 payload를 반환한다")
    void getRefreshToken_존재하는_jti면_payload를_반환한다() {
        // given
        String jti = "jti-123";
        String expectedPayload = "1:USER";

        given(redisTemplate.opsForValue()).willReturn(valueOps);
        given(valueOps.get("refresh:jti-123")).willReturn(expectedPayload);

        // when
        Optional<String> result = tokenStore.getRefreshToken(jti);

        // then
        assertThat(result).isPresent().contains(expectedPayload);
    }

    @Test
    @DisplayName("getRefreshToken - 존재하지 않는 jti면 empty를 반환한다")
    void getRefreshToken_존재하지_않는_jti면_empty를_반환한다() {
        // given
        String jti = "jti-unknown";

        given(redisTemplate.opsForValue()).willReturn(valueOps);
        given(valueOps.get("refresh:jti-unknown")).willReturn(null);

        // when
        Optional<String> result = tokenStore.getRefreshToken(jti);

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("deleteRefreshToken - jti에 해당하는 Refresh Token을 삭제한다")
    void deleteRefreshToken_jti에_해당하는_Refresh_Token을_삭제한다() {
        // given
        String jti = "jti-123";

        given(redisTemplate.delete("refresh:jti-123")).willReturn(true);

        // when
        tokenStore.deleteRefreshToken(jti);

        // then
        verify(redisTemplate).delete("refresh:jti-123");
    }

    @Test
    @DisplayName("addToBlacklist - jti를 블랙리스트에 등록한다")
    void addToBlacklist_jti를_블랙리스트에_등록한다() {
        // given
        String jti = "jti-456";
        long ttlSeconds = 900L; // 15분

        given(redisTemplate.opsForValue()).willReturn(valueOps);

        // when
        tokenStore.addToBlacklist(jti, ttlSeconds);

        // then
        verify(valueOps).set(eq("blacklist:jti-456"), eq("1"), eq(Duration.ofSeconds(ttlSeconds)));
    }

    @Test
    @DisplayName("isBlacklisted - 블랙리스트에 있으면 true를 반환한다")
    void isBlacklisted_블랙리스트에_있으면_true를_반환한다() {
        // given
        String jti = "jti-456";

        given(redisTemplate.hasKey("blacklist:jti-456")).willReturn(true);

        // when
        boolean result = tokenStore.isBlacklisted(jti);

        // then
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("isBlacklisted - 블랙리스트에 없으면 false를 반환한다")
    void isBlacklisted_블랙리스트에_없으면_false를_반환한다() {
        // given
        String jti = "jti-unknown";

        given(redisTemplate.hasKey("blacklist:jti-unknown")).willReturn(false);

        // when
        boolean result = tokenStore.isBlacklisted(jti);

        // then
        assertThat(result).isFalse();
    }
}
