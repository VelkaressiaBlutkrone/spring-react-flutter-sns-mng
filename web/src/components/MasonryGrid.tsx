/**
 * react-masonry-css 래퍼.
 * SNS 이미지 피드용 메이슨리 그리드.
 */
import Masonry from 'react-masonry-css';
import { masonryBreakpoints } from '@/config/masonry';

export const MASONRY_GRID_CLASS = 'masonry-grid';
export const MASONRY_COLUMN_CLASS = 'masonry-grid-column';

export interface MasonryGridProps {
  readonly children: React.ReactNode;
  /** breakpointCols 오버라이드 (기본: masonryBreakpoints) */
  readonly breakpointCols?: Record<number, number> | number;
  /** 컬럼 간격 (px, 기본 16) */
  readonly gap?: number;
  readonly className?: string;
}

export function MasonryGrid({
  children,
  breakpointCols = masonryBreakpoints,
  gap = 16,
  className = '',
}: MasonryGridProps) {
  return (
    <div style={{ '--masonry-gap': `${gap}px` } as React.CSSProperties}>
      <Masonry
        breakpointCols={breakpointCols}
        className={`${MASONRY_GRID_CLASS} ${className}`.trim()}
        columnClassName={MASONRY_COLUMN_CLASS}
      >
        {children}
      </Masonry>
    </div>
  );
}
