import { useEffect, useState } from 'react';

/** SSR-safe: false until mounted, then tracks matchMedia. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);

  return matches;
}

/** Viewport max-width 639px — tight phone layouts */
export function useIsNarrowPhone() {
  return useMediaQuery('(max-width: 639px)');
}

/** Viewport max-width 767px — matches layout “mobile” breakpoint */
export function useIsMobileLayout() {
  return useMediaQuery('(max-width: 767px)');
}
