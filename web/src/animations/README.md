# framer-motion 설정

## 사용법

```tsx
import { motion } from 'framer-motion';
import { fadeIn, spring, listStagger, listItem } from '@/animations';

// 페이드 인
<motion.div variants={fadeIn} initial="hidden" animate="visible">
  ...
</motion.div>

// 리스트 stagger
<motion.ul variants={listStagger} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.li key={item.id} variants={listItem}>
      ...
    </motion.li>
  ))}
</motion.ul>

// 커스텀 spring
<motion.div animate={{ x: 100 }} transition={spring} />
```

## Preset

| 이름 | 용도 |
|------|------|
| `spring` | 기본 바운스 |
| `fadeIn` | 페이드 인/아웃 |
| `slideUp` | 아래→위 슬라이드 |
| `cardHover` | 카드 호버 효과 |
| `listStagger` | 리스트 순차 등장 |
| `likeHeart` | 좋아요 하트 애니메이션 |
