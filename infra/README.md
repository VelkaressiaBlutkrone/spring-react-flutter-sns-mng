# Docker 인프라

spring_thymleaf_map_sns_mng 프로젝트의 Docker 기반 인프라 구성입니다.

## 구성

| 서비스      | 설명                  | 프로파일             |
| ----------- | --------------------- | -------------------- |
| app-db      | MySQL 8.0             | (기본)               |
| app-redis   | Redis 7               | (기본)               |
| app-backend | Spring Boot (Java 21) | backend, mobile, app |
| app-mobile  | Flutter Web           | mobile, app          |

## 빠른 시작

```bash
cd infra
cp .env.example .env
# .env 수정 (JWT_SECRET_KEY 등 운영 시 변경)

# 인프라만 (MySQL + Redis)
docker compose up -d

# Backend 포함
docker compose --profile backend up -d

# Backend + Mobile
docker compose --profile mobile up -d
```

## 접속 정보

| 서비스  | URL                     | 비고                             |
| ------- | ----------------------- | -------------------------------- |
| Backend | <http://localhost:8080> | API, Swagger                     |
| Mobile  | <http://localhost:5174> | Flutter Web                      |
| MySQL   | localhost:3306          | app_user / .env의 MYSQL_PASSWORD |
| Redis   | localhost:6379          |                                  |

## 상세 문서

- [doc/INFRA.md](../doc/INFRA.md) - 전체 가이드
- [doc/DEVELOPMENT_ENVIRONMENT.md](../doc/DEVELOPMENT_ENVIRONMENT.md) - 개발환경 세팅
