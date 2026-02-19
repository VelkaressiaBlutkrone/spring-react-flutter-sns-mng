/**
 * framer-motion 설정.
 * 공통 variants, spring, transition preset.
 */
import type { Variants, Transition } from 'framer-motion';

/** 기본 spring 설정 (자연스러운 바운스) */
export const spring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
};

/** 빠른 트랜지션 */
export const transitionFast: Transition = {
  duration: 0.2,
  ease: 'easeOut',
};

/** 일반 트랜지션 */
export const transitionNormal: Transition = {
  duration: 0.3,
  ease: [0.25, 0.46, 0.45, 0.94],
};

/** 페이드 인 variants */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/** 아래에서 위로 슬라이드 업 */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/** 카드 호버 (SNS 피드용) */
export const cardHover = {
  rest: { scale: 1, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' },
  hover: {
    scale: 1.02,
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    transition: spring,
  },
  tap: { scale: 0.98 },
};

/** 리스트 stagger (순차 등장) */
export const listStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/** 리스트 아이템 (listStagger와 함께 사용) */
export const listItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/** 좋아요 하트 애니메이션 */
export const likeHeart = {
  scale: [1, 1.3, 1],
  transition: { duration: 0.3 },
};
