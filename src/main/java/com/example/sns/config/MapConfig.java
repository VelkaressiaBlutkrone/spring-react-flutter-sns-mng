package com.example.sns.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * 지도 API 설정.
 *
 * <p>Step 11: MapProperties 활성화. Timeout·Retry 정책 적용.
 * RULE 3.4: 외부 호출 Timeout 필수.
 */
@Configuration
@EnableConfigurationProperties(MapProperties.class)
public class MapConfig {

    /**
     * 지도 API 호출용 RestTemplate. RULE 3.4: Timeout 필수.
     */
    @Bean
    public RestTemplate mapRestTemplate(MapProperties mapProperties) {
        int timeoutMs = mapProperties.timeoutSeconds() * 1000;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(java.time.Duration.ofMillis(timeoutMs));
        factory.setReadTimeout(java.time.Duration.ofMillis(timeoutMs));
        return new RestTemplate(factory);
    }
}
