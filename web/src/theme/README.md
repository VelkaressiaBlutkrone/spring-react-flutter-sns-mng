# MUI Theme 설정

`@mui/material`, `@emotion/react`, `@emotion/styled` 패키지 설정.

## 파일 구성

| 파일 | 설명 |
|------|------|
| `index.ts` | MUI theme (palette, typography, components) |
| `emotionCache.ts` | Emotion cache (Tailwind CSS와 스타일 주입 순서 제어) |
| `ThemeProvider.tsx` | CacheProvider + ThemeProvider + CssBaseline 래퍼 |

## 사용법

`main.tsx`에서 `ThemeProvider`로 앱을 감싸면 MUI 컴포넌트 사용 가능.

```tsx
import { ThemeProvider } from '@/theme/ThemeProvider';

<ThemeProvider>
  <App />
</ThemeProvider>
```

## Tailwind CSS와 병행

`emotionCache`의 `prepend: true`로 MUI 스타일이 Tailwind보다 먼저 주입되어 충돌을 줄입니다.
