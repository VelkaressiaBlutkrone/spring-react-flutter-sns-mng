# 지도 기반 SNS 웹/모바일 통합 플랫폼

위치 중심의 지도 UI와 게시글/이미지 SNS를 결합한 웹/모바일 통합 플랫폼입니다.

## 📋 프로젝트 개요

사용자의 위치를 기반으로 지도에서 게시글을 작성하고, Pin을 생성하며, 반경 내 정보를 실시간으로 확인할 수 있는 소셜 네트워크 서비스입니다. 이 프로젝트는 Backend(Spring Boot), Web Frontend(React), Mobile(Flutter)의 세 부분으로 구성된 모노레포(Monorepo) 구조입니다.

### 주요 기능

- 🗺️ **지도 기반 핵심 기능**: 현재 위치 표시, 반경 내 정보 조회, Pin 생성 및 관리
- 📝 **게시판 시스템**: 일반 게시글 및 이미지 게시글 작성/조회/수정/삭제
- 📍 **Pin 관리**: 지도에 Pin 생성 및 게시글 연동
- 👤 **회원 시스템**: 이메일 기반 회원가입/로그인, JWT 인증
- 🔐 **관리자 기능**: 회원 관리, 게시물 관리, 통계 조회 (Thymeleaf 기반)
- 📱 **모바일 지원**: Flutter 기반 크로스 플랫폼 앱

## 🛠️ 기술 스택

### Backend

| 구분           | 기술                            | 버전   |
| -------------- | ------------------------------- | ------ |
| 프레임워크     | Spring Boot                     | 4.0.2  |
| 언어           | Java                            | 21     |
| 웹             | Spring MVC                      | -      |
| 템플릿 엔진    | Thymeleaf (관리자 페이지용)     | -      |
| 보안           | Spring Security, JWT            | -      |
| JWT 라이브러리 | jjwt (API, Impl, Gson)          | 0.12.6 |
| 데이터         | Spring Data JPA, QueryDSL       | 5.1.0  |
| 데이터베이스   | MySQL (운영), H2 (개발)         | 8.0+   |
| 캐시/세션      | Redis, Redisson                 | 3.40.2 |
| API 문서       | Swagger/OpenAPI 3 (springdoc)   | 3.0.1  |
| 빌드           | Gradle                          | -      |
| 테스트         | JUnit 5, Testcontainers, JaCoCo | -      |
| JSON           | Gson                            | -      |

### Web Frontend (React)

| 구분       | 기술                            |
| ---------- | ------------------------------- |
| 언어       | TypeScript                      |
| 프레임워크 | React                           |
| 빌드/개발  | Vite                            |
| 상태 관리  | React Query / Zustand (추정)    |
| 스타일링   | Tailwind CSS, MUI (Material-UI) |
| 지도 API   | react-kakao-maps-sdk            |

### Mobile Frontend (Flutter)

| 구분       | 기술                                 |
| ---------- | ------------------------------------ |
| 프레임워크 | Flutter                              |
| 상태 관리  | Provider / Riverpod (추정)           |
| 지도 API   | Kakao/Naver/Google Map (추상화 설계) |

### Infrastructure

| 구분         | 기술                   |
| ------------ | ---------------------- |
| 컨테이너     | Docker, Docker Compose |
| 데이터베이스 | MySQL 8.0              |
| 캐시         | Redis 7                |

## 📁 프로젝트 구조

```bash
spring_thymleaf_map_sns_mng/
├── src/                                          # Backend (Spring Boot)
│   ├── main/java/com/example/sns/                # 애플리케이션 소스 코드
│   │   ├── config/                               # 설정 (Security, JPA, Redis 등)
│   │   ├── controller/                           # REST API 및 Thymeleaf 컨트롤러
│   │   ├── service/                              # 비즈니스 로직
│   │   ├── domain/                               # 엔티티 및 Value Object
│   │   └── repository/                           # JPA Repository
│   └── main/resources/
│       ├── application.yml                       # 애플리케이션 설정
│       ├── templates/                            # Thymeleaf 템플릿 (관리자용)
│       └── static/                               # 정적 리소스
├── web/                                          # Web Frontend (React)
│   ├── src/                                      # React 소스 코드 (TypeScript)
│   ├── public/                                   # 정적 에셋
│   ├── package.json                              # Node.js 의존성
│   └── vite.config.js                            # Vite 설정
├── mobile/                                       # Mobile Frontend (Flutter)
│   ├── lib/                                      # Flutter 소스 코드
│   └── pubspec.yaml                              # Flutter 의존성
├── infra/                                        # Docker 인프라
│   ├── docker-compose.yml                        # Docker Compose 설정
│   └── .env.example                              # 환경 변수 예제
├── doc/                                          # 프로젝트 문서
├── build.gradle                                  # Gradle 빌드 설정
└── README.md                                     # 프로젝트 소개 (본 문서)
```

## 🚀 빠른 시작

### 사전 요구사항

- Java 21
- Node.js & npm (또는 yarn/pnpm)
- Docker & Docker Compose
- Flutter SDK (모바일 앱 빌드/실행 시)

### 1. 환경 설정

```bash
# 프로젝트 클론
git clone <repository-url>
cd spring_thymleaf_map_sns_mng

# 환경 변수 설정 (Backend, Infra)
cd infra
cp .env.example .env
# .env 파일을 열어 필요한 값 수정 (JWT_SECRET_KEY, DB 비밀번호 등)
```

### 2. 인프라 실행 (Docker)

```bash
# MySQL + Redis 실행
cd infra
docker compose up -d
```

### 3. 로컬 개발 실행

#### Backend (Spring Boot)

```bash
# 프로젝트 루트 디렉토리에서 실행
./gradlew bootRun
```

#### Web Frontend (React)

```bash
# web 디렉토리로 이동
cd web

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

#### Mobile (Flutter)

```bash
cd mobile
flutter pub get
flutter run -d chrome  # 웹 브라우저에서 실행
# 또는
flutter run  # 연결된 디바이스에서 실행
```

### 4. 접속 정보

| 서비스           | URL                                     | 비고                             |
| ---------------- | --------------------------------------- | -------------------------------- |
| Backend API      | <http://localhost:8080>                 | REST API 서버                    |
| Swagger UI       | <http://localhost:8080/swagger-ui.html> | API 문서                         |
| Web Frontend     | <http://localhost:5173>                 | React 웹 애플리케이션            |
| Mobile (Flutter) | -                                       | 연결된 디바이스 또는 에뮬레이터  |
| MySQL            | localhost:3306                          | app_user / .env의 MYSQL_PASSWORD |
| Redis            | localhost:6379                          | -                                |

## 📚 주요 문서

프로젝트의 상세한 정보는 `doc/` 디렉토리의 문서를 참조하세요:

- **[ARCHITECTURE.md](doc/ARCHITECTURE.md)**: 시스템 아키텍처 설계
- **[API_SPEC.md](doc/API_SPEC.md)**: REST API 상세 명세
- **[ERD.md](doc/ERD.md)**: 데이터베이스 스키마 설계
- **[DEVELOPMENT_ENVIRONMENT.md](doc/DEVELOPMENT_ENVIRONMENT.md)**: 개발 환경 세팅 가이드

## 🧪 테스트

### 단위 테스트

```bash
# 단위 테스트 실행 (통합 테스트 제외)
./gradlew test
```

### 통합 테스트

```bash
# Docker가 필요한 통합 테스트 실행
./gradlew integrationTest
```

(이하 내용은 기존 `README.md`와 거의 동일하여 생략)
