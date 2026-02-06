# Flutter Web - 빌드 후 Nginx로 서빙
# context: 프로젝트 루트 (..)

FROM ghcr.io/cirruslabs/flutter:stable AS builder
WORKDIR /app

COPY mobile/pubspec.yaml mobile/pubspec.lock ./
RUN flutter pub get

COPY mobile ./
# 상대 경로 /api 사용 (nginx 프록시로 Backend 연결)
RUN flutter build web --release

# Nginx 런타임
FROM nginx:alpine
COPY --from=builder /app/build/web /usr/share/nginx/html
COPY infra/docker/mobile/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
