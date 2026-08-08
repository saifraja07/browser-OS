import { useEffect, useState } from 'react';
import { MOBILE_BREAKPOINT } from '../core/windowManager/mobileLayout';

/**
 * Reactive mobile/desktop layout flag. Backed by matchMedia so it updates on
 * resize *and* orientation change (rotating a phone doesn't fire `resize`
 * reliably in every browser, matchMedia does).
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(mql.matches);
    update();

    if (mql.addEventListener) {
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    }
    // Safari <14 fallback.
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  return isMobile;
}
