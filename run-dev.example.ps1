# Spring Boot 실행 스크립트 예시
# 사용: 복사하여 run-dev.ps1 로 저장한 뒤 실제 값으로 교체

# === dev 프로파일 (H2 인메모리, Redis 미사용) ===
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:MAP_KAKAO_JS_APP_KEY = "발급받은_JavaScript_키"
$env:MAP_KAKAO_MOBILITY_API_KEY = "발급받은_Mobility_API_키"

# === prod 프로파일 (MySQL + Redis) 사용 시 아래 주석 해제 후 설정 ===
# $env:SPRING_PROFILES_ACTIVE = "prod"                    # 실행할 Spring 프로파일 (운영 환경: prod)
# # MySQL (필수)
# $env:DB_URL = "jdbc:mysql://호스트:3306/DB명?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8"  # 호스트: DB가 실행 중인 MySQL 서버 주소, DB명: 데이터베이스 이름
# $env:DB_USERNAME = "DB사용자"                            # MySQL 데이터베이스 계정명
# $env:DB_PASSWORD = "DB비밀번호"                          # MySQL 데이터베이스 비밀번호
# $env:DB_DRIVER = "com.mysql.cj.jdbc.Driver"              # MySQL JDBC 드라이버 클래스명(고정)
# # Redis (필수)
# $env:REDIS_HOST = "Redis호스트"                          # Redis 서버 주소 (예: localhost 또는 실제 서버 주소)
# $env:REDIS_PORT = "6379"                                 # Redis 포트(기본: 6379)
# $env:REDIS_PASSWORD = ""                                 # Redis 비밀번호(설정된 경우 입력, 미설정 시 빈 값)
# # JWT (필수, 256비트 이상)
# $env:JWT_ISSUER = "https://api.example.com"              # JWT 토큰 발급자(프로젝트 API 주소)
# $env:JWT_AUDIENCE = "spring-thymleaf-map-sns-mng"        # JWT 토큰 대상자(임의의 서비스 식별자)
# $env:JWT_SECRET_KEY = "256비트_이상_시크릿_키"            # 256비트(32자 이상) 시크릿 키 (예: 임의의 복잡한 문자열)
# # CORS (필수, 쉼표 구분, * 금지)
# $env:CORS_ALLOWED_ORIGINS = "https://프론트엔드도메인"    # 허용할 프론트엔드 도메인 목록(쉼표로 구분, 와일드카드 * 사용 불가)
# # 선택
# $env:SERVER_PORT = "8080"                                # 서버 포트(생략 시 8080)
# $env:MAP_KAKAO_ORIGIN = "https://프론트엔드도메인"        # 카카오 API 호출 시 Origin 헤더로 보낼 값(프론트 도메인)
# $env:UPLOAD_BASE_PATH = "/var/uploads"                   # 파일 업로드 기본 경로(필요 시)

.\gradlew bootRun
