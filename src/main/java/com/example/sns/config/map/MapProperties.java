package com.example.sns.config.map;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 지도 API 설정.
 *
 * <p>RULE 1.1: API Key·비밀정보는 환경 변수로 주입.
 * RULE 3.4: 외부 호출 Timeout·Retry 정책.
 * Step 11: provider(kakao|naver|google|none), timeout, retry 설정.
 */
@ConfigurationProperties(prefix = "app.map")
public record MapProperties(
        /**
         * 지도 API 제공자: kakao, naver, google, none(미사용).
         */
        String provider,

        /**
         * Geocoding API 호출 타임아웃 (초).
         */
        int timeoutSeconds,

        /**
         * 실패 시 재시도 횟수.
         */
        int retryCount,

        /**
         * Google Maps API Key (provider=google 시 환경 변수 필수).
         */
        String googleApiKey,

        /**
         * Kakao REST API Key (provider=kakao 시 환경 변수 필수).
         */
        String kakaoApiKey,

        /**
         * Kakao Mobility Directions API Key (경로/거리 측정용).
         * 미설정 시 kakao-api-key 사용. MAP_KAKAO_MOBILITY_API_KEY 환경 변수.
         */
        String kakaoMobilityApiKey,

        /**
         * Naver Client ID (provider=naver 시 환경 변수 필수).
         */
        String naverClientId,

        /**
         * Naver Client Secret (provider=naver 시 환경 변수 필수).
         */
        String naverClientSecret,

        /**
         * Kakao Maps JavaScript API App Key (Step 12: 프론트 지도 표시용).
         * RULE 1.1: 환경 변수로 주입.
         */
        String kakaoJsAppKey,

        /**
         * Kakao Mobility API KA/Origin 헤더용 (서버 호출 시 필수).
         * 미설정 시 http://localhost:5173 (개발 기본값).
         */
        String kakaoOrigin
) {
    public MapProperties {
        if (provider == null) provider = "none";
        if (timeoutSeconds <= 0) timeoutSeconds = 5;
        if (retryCount < 0) retryCount = 2;
    }
}
