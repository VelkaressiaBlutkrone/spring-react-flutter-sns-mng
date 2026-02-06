# Spring Boot/백엔드 관련 문제

## 문제: spring-boot-starter-aop를 찾을 수 없음

**에러 메시지:**

```text
Could not find org.springframework.boot:spring-boot-starter-aop:.
```

**원인:**

- Spring Boot 4.0에서는 `spring-boot-starter-aop`가 `spring-boot-starter-aspectj`로 변경됨
- 또는 Spring Milestone Repository 필요

**해결 방법:**

### build.gradle 수정

```gradle
repositories {
    mavenCentral()
    maven { url 'https://repo.spring.io/milestone' }  // Spring Boot 4.x
}

dependencies {
    // Spring Boot 4.0: AOP는 spring-aop + aspectjweaver 직접 추가
    implementation 'org.springframework:spring-aop'
    implementation 'org.aspectj:aspectjweaver'
}
```

---

## 문제: JSON 직렬화 라이브러리 변경 (Jackson → Gson)

**해결 방법:**

### build.gradle

```gradle
implementation 'com.google.code.gson:gson'
```

### 코드 수정

```java
// 변경 전
import com.fasterxml.jackson.databind.ObjectMapper;
private final ObjectMapper objectMapper;
String resultStr = objectMapper.writeValueAsString(result);

// 변경 후
import com.google.gson.Gson;
private final Gson gson;
String resultStr = gson.toJson(result);
```

Spring Boot는 Gson Bean을 자동 생성하므로 `@RequiredArgsConstructor`로 주입 가능합니다.

---

## 문제: WebRequest.getParameterNames() 타입 불일치

**에러 메시지:**

```text
incompatible types: Iterator<String> cannot be converted to String[]
```

**원인:**

- Spring Boot 4.0 / Jakarta EE에서 `getParameterNames()` 반환 타입이 `Iterator<String>`으로 변경됨

**해결 방법:**

```java
// 변경 전
String[] paramNames = request.getParameterNames();

// 변경 후
Iterator<String> paramNames = request.getParameterNames();
if (paramNames != null && paramNames.hasNext()) {
    while (paramNames.hasNext()) {
        String paramName = paramNames.next();
        // ...
    }
}
```

---

## 문제: 테스트 실패 - NoSuchBeanDefinitionException

**에러 메시지:**

```text
NoSuchBeanDefinitionException
UnsatisfiedDependencyException
```

**원인:**

- `@SpringBootTest` 실행 시 MySQL 등 DB 연결 실패
- 테스트 환경에 DB가 없음

**해결 방법:**

### 1. build.gradle에 H2 테스트 의존성

```gradle
testRuntimeOnly 'com.h2database:h2'
```

### 2. 테스트용 application 설정

`src/test/resources/application-test.yml` 또는 `application.properties`:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: create-drop
    properties:
      hibernate:
        dialect: org.hibernate.dialect.H2Dialect
```

### 3. 테스트 프로파일 지정

`@SpringBootTest` 또는 `@ActiveProfiles("test")` 사용.
