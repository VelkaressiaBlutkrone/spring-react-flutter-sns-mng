package com.example.sns.service.auth;

import java.util.Optional;

/**
 * Refresh Token 및 JWT 블랙리스트 저장소 인터페이스.
 *
 * RULE 6.1.7(Revocation), 6.5(Refresh Token Redis) 준수.
 * Redis 키: refresh:{jti}, blacklist:{jti}
 */
public interface TokenStore {

    /**
     * Refresh Token을 Redis에 저장한다.
     *
     * @param jti        JWT ID (고유 식별자)
     * @param payload    저장할 값 (userId, role 등)
     * @param ttlSeconds TTL (초). 7~30일 권장 (RULE 6.5)
     */
    void saveRefreshToken(String jti, String payload, long ttlSeconds);

    /**
     * Refresh Token을 조회한다.
     *
     * @param jti JWT ID
     * @return 저장된 payload, 없으면 empty
     */
    Optional<String> getRefreshToken(String jti);

    /**
     * Refresh Token을 삭제한다. (로그아웃 시)
     *
     * @param jti JWT ID
     */
    void deleteRefreshToken(String jti);

    /**
     * Access Token jti를 블랙리스트에 등록한다.
     *
     * @param jti        JWT ID
     * @param ttlSeconds Access Token 남은 유효시간 (초)
     */
    void addToBlacklist(String jti, long ttlSeconds);

    /**
     * Access Token jti가 블랙리스트에 있는지 확인한다.
     *
     * @param jti JWT ID
     * @return 블랙리스트에 있으면 true
     */
    boolean isBlacklisted(String jti);
}
