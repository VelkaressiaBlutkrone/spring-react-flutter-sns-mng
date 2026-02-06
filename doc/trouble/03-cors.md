# CORS 관련 문제

## 문제: 프론트엔드에서 API 호출 시 CORS 오류 발생

**에러 메시지:**

```text
Access to XMLHttpRequest at 'http://localhost:8080/api/xxx' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**원인:**

- 백엔드 CORS 설정이 프론트엔드 도메인을 허용하지 않음
- Security 설정이 CORS를 차단함

**해결 방법:**

### 1. CORS 설정 확인

`CorsConfig` 또는 `CorsProperties` 등 CORS 설정 클래스 확인:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");  // 개발 환경. 운영 시 허용 오리진 제한
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

### 2. SecurityConfig 확인

`SecurityConfig`에서 CORS 필터 적용 여부 확인:

```java
http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
```

### 3. 프론트엔드 API URL 확인

환경 변수 또는 `.env`:

```text
VITE_API_BASE_URL=http://localhost:8080
```

프록시 사용 시 상대 경로 `/api` 사용.
