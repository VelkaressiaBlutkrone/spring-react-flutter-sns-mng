# Spring Boot 실행 스크립트 예시
# 사용: 복사하여 run-dev.ps1 로 저장한 뒤 실제 값으로 교체

# === dev 프로파일 (H2 인메모리, Redis 미사용) ===
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:MAP_KAKAO_JS_APP_KEY = "발급받은_JavaScript_키"
$env:MAP_KAKAO_MOBILITY_API_KEY = "발급받은_Mobility_API_키"

# === prod 프로파일 (MySQL + Redis) 사용 시 아래 주석 해제 후 설정 ===
# $env:SPRING_PROFILES_ACTIVE = "prod"
# # MySQL (필수)
# $env:DB_URL = "jdbc:mysql://호스트:3306/DB명?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8"
# $env:DB_USERNAME = "DB사용자"
# $env:DB_PASSWORD = "DB비밀번호"
# $env:DB_DRIVER = "com.mysql.cj.jdbc.Driver"
# # Redis (필수)
# $env:REDIS_HOST = "Redis호스트"
# $env:REDIS_PORT = "6379"
# $env:REDIS_PASSWORD = ""
# # JWT (필수, 256비트 이상)
# $env:JWT_ISSUER = "https://api.example.com"
# $env:JWT_AUDIENCE = "spring-thymleaf-map-sns-mng"
# $env:JWT_SECRET_KEY = "256비트_이상_시크릿_키"
# # CORS (필수, 쉼표 구분, * 금지)
# $env:CORS_ALLOWED_ORIGINS = "https://프론트엔드도메인"
# # 선택
# $env:SERVER_PORT = "8080"
# $env:MAP_KAKAO_ORIGIN = "https://프론트엔드도메인"
# $env:UPLOAD_BASE_PATH = "/var/uploads"

.\gradlew bootRun
