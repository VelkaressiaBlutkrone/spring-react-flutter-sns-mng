package com.example.sns.config.map;

import java.util.concurrent.TimeUnit;

import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * 지도 API 설정.
 *
 * <p>Step 11: MapProperties 활성화. Timeout·Retry 정책 적용.
 * RULE 3.4: 외부 호출 Timeout 필수.
 * Apache HttpClient 5 사용: HttpURLConnection 의 Origin·KA 등 커스텀 헤더 차단 문제 해소.
 */
@Configuration
@EnableConfigurationProperties(MapProperties.class)
public class MapConfig {

    /**
     * 지도 API 호출용 RestTemplate. RULE 3.4: Timeout 필수.
     * Apache HttpClient 5 기반 — 모든 커스텀 헤더 정상 전송 보장.
     */
    @Bean
    public RestTemplate mapRestTemplate(MapProperties mapProperties) {
        int timeoutMs = mapProperties.timeoutSeconds() * 1000;

        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectionRequestTimeout(timeoutMs, TimeUnit.MILLISECONDS)
                .setResponseTimeout(timeoutMs, TimeUnit.MILLISECONDS)
                .build();

        CloseableHttpClient httpClient = HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .build();

        return new RestTemplate(new HttpComponentsClientHttpRequestFactory(httpClient));
    }
}
