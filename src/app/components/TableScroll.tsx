import type { ReactNode } from 'react';

const outer =
  'min-w-0 max-w-full overflow-x-auto overflow-y-visible touch-pan-x overscroll-x-contain [-webkit-overflow-scrolling:touch]';

/**
 * Wrap wide tables so they scroll horizontally on small screens (parent must allow min-w-0 in flex chain).
 */
export function TableScroll({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${outer} ${className}`.trim()}>{children}</div>;
}
