# React 웹 프론트엔드 배포 가이드 (TASK_WEB Step 10)

> **기준 문서**: [RULE.md](RULE.md) 1.1(비밀정보 외부 주입), [TASK_WEB.md](TASK_WEB.md) Step 10
> **전제**: Backend API 배포 완료, CORS 허용 오리진 설정

---

## 1. 프로덕션 빌드

### 1.1 빌드 명령

```bash
cd web

# 환경 변수 설정 후 빌드 (RULE 1.1: 비밀정보 외부 주입)
# Windows PowerShell
$env:VITE_API_BASE_URL = "https://api.example.com"
$env:VITE_MAP_KAKAO_JS_APP_KEY = "your-kakao-js-key"
npm run build

# Linux / macOS
export VITE_API_BASE_URL=https://api.example.com
export VITE_MAP_KAKAO_JS_APP_KEY=your-kakao-js-key
npm run build
```

### 1.2 환경 변수 (.env.production)

빌드 시점에 `VITE_*` 변수가 정적 파일에 주입된다. **실제 값은 CI/CD 또는 배포 스크립트에서 설정**한다.

| 변수                        | 필수 | 설명                                                   |
| --------------------------- | ---- | ------------------------------------------------------ |
| `VITE_API_BASE_URL`         | ✅   | Backend API 베이스 URL (예: `https://api.example.com`) |
| `VITE_MAP_KAKAO_JS_APP_KEY` | ✅   | 카카오맵 JavaScript API Key (지도 표시용)              |

**템플릿**: `web/.env.production.example`을 복사하여 `web/.env.production` 생성 후 값 채우기.
**주의**: `.env.production`은 `.gitignore` 대상. 절대 커밋하지 않는다.

### 1.3 빌드 산출물

```
web/dist/
├── index.html
├── assets/
│   ├── index-*.js      ← 진입점
│   ├── vendor-*.js     ← React, Router
│   ├── react-query-*.js
│   ├── ui-vendor-*.js  ← MUI, Emotion
│   ├── map-*.js        ← Kakao Map SDK
│   ├── charts-*.js     ← Recharts
│   └── *.css
```

- **청크 분할**: `vite.config.js`의 `manualChunks`로 vendor·map·charts 분리
- **압축**: esbuild minify, `console`·`debugger` 제거
- **소스맵**: 프로덕션 빌드에서는 비활성화 (`sourcemap: false`)

### 1.4 빌드 검증

```bash
# 로컬에서 프로덕션 빌드 미리보기
npm run preview

# 브라우저에서 http://localhost:4173 접속
# API 호출이 VITE_API_BASE_URL로 전달되는지 확인
```

---

## 2. 배포 구조 선택

### 2.1 Nginx (권장)

프론트엔드와 Backend를 분리 배포할 때 Nginx가 정적 파일을 서빙하고, `/api`는 Backend로 프록시한다.

```nginx
server {
    listen 80;
    server_name app.example.com;
    root /var/www/sns-web/dist;
    index index.html;

    # SPA 라우팅 — 모든 경로를 index.html로
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 프록시 (동일 도메인 시 CORS 불필요)
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 정적 에셋 캐시
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**환경 변수**: `VITE_API_BASE_URL`을 **빈 값** 또는 **상대 경로**로 두면, 같은 도메인(`/api`)으로 요청되어 CORS 이슈가 없다.

### 2.2 Backend 정적 서빙 (Spring Boot)

프론트엔드와 Backend를 같은 서버에서 서빙할 때, Spring Boot가 `dist/` 내용을 정적 리소스로 제공한다.

```java
// WebMvcConfig 또는 별도 설정
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/**")
            .addResourceLocations("classpath:/static/");
}
```

**배치 절차**:

1. `npm run build`로 `web/dist/` 생성
2. `dist/` 내용을 `src/main/resources/static/`으로 복사
3. `./gradlew bootJar`로 JAR 빌드

**환경 변수**: `VITE_API_BASE_URL`을 **빈 값**으로 두면, 같은 오리진에서 `/api` 호출.

### 2.3 CDN (CloudFront, Cloudflare 등)

대규모 트래픽 시 정적 에셋을 CDN에 올리고, HTML만 오리진에서 서빙한다.

1. `web/dist/assets/` → CDN 버킷 또는 오리진에 업로드
2. `index.html`의 에셋 경로를 CDN URL로 치환 (Vite는 기본적으로 상대 경로 사용)
3. `base` 옵션으로 CDN 경로 지정 가능: `vite.config.js` → `base: 'https://cdn.example.com/sns/'`

---

## 3. Backend 연동 최종 확인

### 3.1 CORS 설정

프론트엔드와 Backend가 **다른 오리진**일 때, Backend의 `CORS_ALLOWED_ORIGINS`에 프론트엔드 오리진을 포함해야 한다.

| 배포 구조         | 프론트 오리진             | Backend CORS 설정                              |
| ----------------- | ------------------------- | ---------------------------------------------- |
| Nginx 동일 도메인 | `https://app.example.com` | `/api` 프록시 시 CORS 불필요                   |
| 분리 배포         | `https://app.example.com` | `CORS_ALLOWED_ORIGINS=https://app.example.com` |
| 로컬 개발         | `http://localhost:5173`   | `CORS_ALLOWED_ORIGINS=http://localhost:5173`   |

- [DEPLOYMENT.md](DEPLOYMENT.md) 2.2절 `CORS_ALLOWED_ORIGINS` 참조
- `*`(와일드카드)와 `credentials: true`는 동시 사용 불가

### 3.2 API 베이스 URL

| 상황                      | `VITE_API_BASE_URL`                |
| ------------------------- | ---------------------------------- |
| Nginx/Backend 동일 도메인 | 빈 값 `""` (상대 경로 `/api` 사용) |
| Backend 별도 도메인       | `https://api.example.com`          |
| 개발 (Vite proxy)         | 빈 값 또는 `http://localhost:8080` |

### 3.3 체크리스트

- [ ] `npm run build` 성공
- [ ] `npm run preview`로 로그인·API 호출 동작 확인
- [ ] `VITE_API_BASE_URL`·`VITE_MAP_KAKAO_JS_APP_KEY`가 배포 환경에서 주입됨
- [ ] Backend `CORS_ALLOWED_ORIGINS`에 프론트 오리진 포함
- [ ] 카카오맵 도메인 등록(카카오 개발자 콘솔)에 배포 도메인 추가

---

## 4. CI/CD 예시 (참고)

비밀정보는 CI/CD Secret으로 주입한다. 예시(GitHub Actions):

```yaml
- name: Build web
  working-directory: web
  env:
    VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
    VITE_MAP_KAKAO_JS_APP_KEY: ${{ secrets.VITE_MAP_KAKAO_JS_APP_KEY }}
  run: npm ci && npm run build

- name: Deploy to S3 / Nginx
  run: |
    # dist/를 S3 업로드 또는 rsync로 서버 배치
```

---

## 5. 참고 문서

- [DEPLOYMENT.md](DEPLOYMENT.md) — Backend 배포, 환경 변수, CORS
- [INFRA.md](INFRA.md) — Docker Compose, 인프라 구성
- [TASK_WEB.md](TASK_WEB.md) — Step 10 완료 기준
- [RULE.md](RULE.md) 1.1 — 비밀정보 외부 주입0 완료 기준
- [RULE.md](RULE.md) 1.1 — 비밀정보 외부 주입
