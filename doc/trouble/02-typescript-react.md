# TypeScript/React 관련 문제

## 문제: JSX 태그에 'react/jsx-runtime' 모듈 경로가 필요하지만 찾을 수 없음

**에러 메시지:**

```text
This JSX tag requires the module path 'react/jsx-runtime' to exist, but none could be found.
Make sure you have types for the appropriate package installed.
```

**원인:**

- TypeScript가 React의 JSX 런타임 타입을 찾지 못함
- `tsconfig.json`의 `jsxImportSource` 설정이 누락됨

**해결 방법:**

### 1. tsconfig.app.json 수정

`frontend/tsconfig.app.json` (또는 `tsconfig.json`)의 `compilerOptions`에 다음 추가/수정:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "skipLibCheck": true
  }
}
```

### 2. node_modules 재설치

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

Windows PowerShell:

```powershell
cd frontend
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm install
```

`@types/react`, `@types/react-dom` 확인:

```bash
npm list @types/react @types/react-dom
```

없으면:

```bash
npm install --save-dev @types/react @types/react-dom
```

### 3. TypeScript 서버 재시작

VS Code/Cursor: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

---

## 문제: TypeScript 모듈 export 오류 (런타임)

**에러 메시지:**

```text
Uncaught SyntaxError: The requested module '/src/types/xxx.types.ts' does not provide an export named 'XxxResponse'
```

**원인:**

- Vite 개발 서버의 모듈 캐시 문제
- 개발 서버가 변경사항을 인식하지 못함

**해결 방법:**

### 1. Vite 개발 서버 재시작

```bash
cd frontend
# Ctrl+C로 서버 중지 후
npm run dev
```

### 2. Vite 캐시 삭제

```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### 3. 브라우저 캐시

개발자 도구(F12) → 네트워크 탭 "Disable cache" 체크 → Ctrl+Shift+R 새로고침

---

## 문제: erasableSyntaxOnly로 인한 enum 사용 불가

**에러 메시지:**

```text
This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
```

**원인:**

- `erasableSyntaxOnly: true` 옵션이 enum 사용을 막음
- enum은 런타임 코드를 생성하므로 erasable syntax가 아님

**해결 방법:**

`tsconfig.app.json`에서 `erasableSyntaxOnly` 옵션 제거:

```json
{
  "compilerOptions": {
    // "erasableSyntaxOnly": true,  // 이 줄 제거
  }
}
```

---

## 문제: verbatimModuleSyntax로 인한 타입 import 오류

**에러 메시지:**

```text
'XxxRequest' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
```

**원인:**

- `verbatimModuleSyntax: true` 활성화 시 타입만 사용하는 경우 `import type` 필요

**해결 방법:**

타입만 import하는 경우 `import type` 사용:

```typescript
// 변경 전 (오류)
import { XxxRequest, XxxResponse } from '@/types/xxx.types';

// 변경 후
import type { XxxRequest, XxxResponse } from '@/types/xxx.types';
```

타입과 값을 모두 사용하는 경우:

```typescript
import type { XxxRequest, XxxResponse } from '@/types/xxx.types';
import { XxxStatus } from '@/types/xxx.types';  // enum 등
```
