/**
 * Emotion Cache 설정.
 * Tailwind CSS와 MUI 병행 시 스타일 주입 순서 제어.
 * prepend: true → MUI 스타일이 Tailwind보다 먼저 주입되어 충돌 방지.
 */
import createCache from '@emotion/cache';

export const emotionCache = createCache({
  key: 'mui',
  prepend: true,
});
