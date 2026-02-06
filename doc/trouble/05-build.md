# 빌드 관련 문제

## 백엔드 빌드 문제

### 문제: Gradle 컴파일 실패

**에러 메시지:**

```text
Execution failed for task ':compileJava'
```

**해결 방법:**

#### 1. Gradle 캐시 정리

```bash
./gradlew clean
./gradlew build --refresh-dependencies
```

#### 2. QueryDSL Q클래스 생성 확인

QueryDSL 사용 시:

```bash
./gradlew clean
./gradlew compileJava
```

생성 위치: `build/generated/querydsl/`

#### 3. Java 버전 확인

`build.gradle`:

```gradle
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}
```

```bash
java -version
```

---

### 문제: spring-boot-starter-aop 찾을 수 없음

**해결 방법:**

[04-spring-boot.md](./04-spring-boot.md) 참고. Spring Milestone Repository 추가 및 AOP 의존성 변경.

---

## 프론트엔드 빌드 문제

### 문제: Vite 빌드 실패

**에러 메시지:**

```text
Failed to resolve import
```

**해결 방법:**

#### 1. 의존성 재설치

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### 2. Vite 캐시 정리

```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

#### 3. TypeScript 타입 확인

```bash
cd frontend
npm run build
```

---

### 문제: 의존성 해석 실패 (react-router-dom, clsx 등)

**에러 메시지:**

```text
Could not resolve "react-router-dom"
Could not resolve "clsx"
```

**원인:**

- `package.json`에 선언은 되어 있으나 `node_modules`에 미설치

**해결 방법:**

```bash
cd frontend
npm install
npm run dev
```

---

### 문제: Tailwind CSS 미적용

**증상:**

- Tailwind 클래스가 적용되지 않은 것처럼 보임

**해결 방법:**

#### 1. Tailwind 진입 CSS 생성

`frontend/src/index.css`:

```css
@import "tailwindcss";
```

(Tailwind 버전에 따라 `@tailwind base;` 등 사용)

#### 2. main.tsx에서 import

```tsx
import '@/index.css';
```

---

### 문제: frontend에서 Gradle 명령어 실행 오류

**에러 메시지:**

```text
Project directory '.../frontend' is not part of the build defined by settings.gradle
```

**원인:**

- `frontend`는 npm 프로젝트이므로 Gradle 사용 불가

**해결 방법:**

- **백엔드 빌드**: 프로젝트 루트에서 `./gradlew clean build`
- **프론트엔드 빌드**: `frontend/`에서 `npm run dev` 또는 `npm run build`
