# SNS 디자인 패키지 설정

framer-motion, @mui/icons-material, react-masonry-css 설정 가이드.

## 1. framer-motion

**경로**: `src/animations/`

| 파일 | 설명 |
|------|------|
| index.ts | variants, spring, transition preset |
| README.md | 사용법 |

```tsx
import { motion } from 'framer-motion';
import { fadeIn, listStagger, listItem } from '@/animations';

<motion.ul variants={listStagger} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.li key={item.id} variants={listItem}>...</motion.li>
  ))}
</motion.ul>
```

## 2. @mui/icons-material

**경로**: `src/icons/`

| 파일 | 설명 |
|------|------|
| index.ts | SNS용 아이콘 barrel (tree-shaking) |
| README.md | 카테고리별 목록 |

```tsx
import { FavoriteIcon, ShareIcon } from '@/icons';

<IconButton><FavoriteIcon /></IconButton>
```

## 3. react-masonry-css

**경로**: `src/components/MasonryGrid.tsx`, `src/config/masonry.ts`, `src/index.css`

| 파일 | 설명 |
|------|------|
| MasonryGrid.tsx | 메이슨리 그리드 래퍼 |
| config/masonry.ts | breakpoint (1400/900/500px) |
| index.css | .masonry-grid, .masonry-grid-column 스타일 |

```tsx
import { MasonryGrid } from '@/components';
import { masonryBreakpoints } from '@/config/masonry';

<MasonryGrid breakpointCols={masonryBreakpoints} gap={16}>
  {images.map((img) => (
    <div key={img.id}>...</div>
  ))}
</MasonryGrid>
```
