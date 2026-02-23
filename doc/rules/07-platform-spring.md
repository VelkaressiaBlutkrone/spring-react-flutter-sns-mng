# 7.1 Spring Boot 플랫폼 가이드 (Back-end)

> 상위 문서: [07-platform.md](07-platform.md) | 원본: [RULE.md](../RULE.md) 7장

백엔드에서는 **보안 규정**과 **데이터 무결성**에 집중한다.

---

## 7.1.1 [보안] 환경 변수 관리

**Rule**: DB 비밀번호 등 민감 정보는 `application.yml`에 직접 노출하지 않고 **환경 변수**를 사용한다.

```yaml
# Good Case
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

- `.env` 파일, `run-dev.ps1` 등 시작 스크립트에서 주입
- `application-prod.yml` 에서도 하드코딩 금지
- 시크릿 파일(`.env`, `run-dev.ps1`)은 `.gitignore`에 반드시 추가

---

## 7.1.2 [기능] 전역 에러 핸들러 (Global Exception Handler)

**Rule**: 모든 예외는 **공통된 객체 형식**으로 반환하여 클라이언트의 처리를 돕는다.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        ErrorResponse response = new ErrorResponse(e.getErrorCode(), e.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception e) {
        return ResponseEntity.internalServerError()
                .body(new ErrorResponse("INTERNAL_ERROR", "서버 오류가 발생했습니다."));
    }
}
```

- `ErrorResponse` 는 `code`, `message` 필드를 포함하는 공통 Record/DTO 사용
- 예외 계층: `BusinessException` → 도메인 예외 → `RuntimeException` 순서로 처리

---

## 7.1.3 [API] URI 설계 및 계층형 자원 구현 (RULE 2.1.4)

**Rule**: 계층형 자원 지향 URI를 적용하고, `@Controller`, `@RestController`에서 `@RequestMapping`·`@PathVariable`로 계층을 표현한다.

```java
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // 1. 컬렉션
    @GetMapping
    public Page<OrderResponse> getOrders(@ModelAttribute OrderSearchCond cond, Pageable pageable) {
        return orderService.search(cond, pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@Valid @RequestBody OrderCreateRequest req) {
        return orderService.create(req);
    }

    // 2. 단일 리소스
    @GetMapping("/{orderId}")
    public OrderDetailResponse getOrder(@PathVariable Long orderId) {
        return orderService.getDetail(orderId);
    }

    @PatchMapping("/{orderId}")
    public OrderResponse updateOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderUpdateRequest req) {
        return orderService.update(orderId, req);
    }

    // 3. 하위 리소스
    @GetMapping("/{orderId}/items")
    public List<OrderItemResponse> getOrderItems(@PathVariable Long orderId) {
        return orderService.getItems(orderId);
    }

    @PostMapping("/{orderId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderItemResponse addOrderItem(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderItemCreateRequest req) {
        return orderService.addItem(orderId, req);
    }

    // 4. 액션
    @PostMapping("/{orderId}/cancel")
    public OrderResponse cancelOrder(@PathVariable Long orderId) {
        return orderService.cancel(orderId);
    }
}
```

**표준 URI 구조 예시** (2026년 기준):

```text
/api/v{version}                     ← v1 생략 가능
  /orders                           ← 컬렉션
  /orders/{orderId}
  /orders/{orderId}/items
  /orders/{orderId}/items/{itemId}
  /orders/{orderId}/cancel          ← 상태 변경 액션
  /orders/search                    ← 검색 전용
  /me/orders                        ← 현재 사용자 관련
```

---

## 7.1.4 [기능] 서비스 레이어 구조

**Rule**: 비즈니스 로직은 `@Service` 레이어에 집중하고, Controller는 입력/출력 변환만 담당한다.

| 레이어 | 역할 | 금지 사항 |
|---|---|---|
| `Controller` | 요청 수신, 응답 직렬화 | 비즈니스 로직 작성 금지 |
| `Service` | 트랜잭션, 도메인 로직 | 직접 HTTP 객체 사용 금지 |
| `Repository` | DB 접근, 쿼리 | 비즈니스 로직 작성 금지 |

```java
// Good — 서비스에 로직 집중
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional
    public OrderResponse create(OrderCreateRequest req) {
        Order order = Order.create(req);        // 도메인 메서드
        return OrderResponse.from(orderRepository.save(order));
    }
}
```

---

## 7.1.5 [기술] Java Record 사용 (DTO)

**Rule**: DTO·설정 값 객체는 Java Record(`record`)를 우선 사용하여 불변성을 보장한다.

```java
// DTO
public record OrderCreateRequest(
    @NotBlank String productName,
    @Positive int quantity
) {}

// 설정
@ConfigurationProperties(prefix = "app.map")
public record MapProperties(
    String kakaoJsAppKey,
    String kakaoMobilityApiKey,
    int timeoutSeconds
) {}
```

---

## 7.1.6 [보안] Spring Security — 인증·인가 설정

**Rule**: `SecurityFilterChain` Bean 방식 사용(XML 설정 금지), CORS는 `CorsConfigurationSource` Bean으로 관리한다.

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()  // preflight
                .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
                .anyRequest().authenticated())
            .build();
    }
}
```

---

## 참고 문서

- [01-security.md](01-security.md) — 보안 공통 규칙
- [06-auth-token.md](06-auth-token.md) — 인증·토큰 관리
- [08-javascript.md](08-javascript.md) — 프론트엔드 JS/TS 규칙
- [07-platform-react.md](07-platform-react.md) — React 플랫폼 가이드
- [07-platform-flutter.md](07-platform-flutter.md) — Flutter 플랫폼 가이드
