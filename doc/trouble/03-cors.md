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

---

## 문제: Flutter Web 로그인 시 connection error (Postman은 정상)

**에러 메시지:**

```text
DioException [connection error]: The XMLHttpRequest onError callback was called.
This typically indicates an error on the network layer.
```

**증상:**

- Postman으로 `POST /api/auth/login` 호출 시 200 OK 정상
- Flutter Web에서 동일 API 호출 시 connection error

**원인:**

- **CORS**: 브라우저는 다른 origin 간 요청을 차단. Postman은 CORS 미적용.
- Flutter Web: `http://localhost:8081` (또는 랜덤 포트) → API: `http://localhost:8080` → 서로 다른 origin

**해결 방법:**

### 1. application-dev.yml CORS 패턴 추가

Flutter Web 랜덤 포트 대응을 위해 `allowed-origin-patterns` 사용:

```yaml
app:
  cors:
    allowed-origin-patterns: http://localhost:*,http://127.0.0.1:*
```

### 2. Backend 재시작

`gradle bootRun` 재실행 후 Flutter Web에서 재시도.

### 3. Flutter Web 고정 포트 사용 (선택)

```bash
flutter run -d chrome --web-port=8081
```

`http://localhost:8081`이 CORS 허용 목록에 포함되어야 함.
