# 설정 가이드

## TypeScript Import Path Alias 설정

TypeScript에서 `@/` alias로 import 경로를 간소화할 수 있습니다.

### 설정 방법

#### 1. TypeScript 설정 (`tsconfig.app.json`)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 2. Vite 설정 (`vite.config.ts`)

```typescript
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

#### 3. Import 예시

```typescript
// 상대 경로 대신
import { XxxResponse } from '@/types/xxx.types';
import { getItems } from '@/services/api';
import { formatDate } from '@/utils/dateUtils';
```

### 문제 해결

Path alias 미작동 시:

1. **TypeScript 서버 재시작**: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
2. **Vite 개발 서버 재시작**: `npm run dev`
3. **캐시 삭제**: `rm -rf node_modules/.vite` 후 `npm run dev`
