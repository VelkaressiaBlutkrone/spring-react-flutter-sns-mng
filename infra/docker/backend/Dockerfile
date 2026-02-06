# Spring Boot Backend - Java 21
# build.gradle의 bootJar { archiveFileName = 'app.jar' } 설정 필요

FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Gradle wrapper 및 설정 복사
COPY gradlew .
COPY gradlew.bat .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

RUN chmod +x gradlew

# 의존성 다운로드 (캐시 활용)
RUN ./gradlew dependencies --no-daemon || true

# 소스 복사 및 빌드
COPY src src
RUN ./gradlew bootJar -x test --no-daemon

# 런타임 이미지
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -g 1000 app && adduser -u 1000 -G app -D app
USER app

COPY --from=builder /app/build/libs/app.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
