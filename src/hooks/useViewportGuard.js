import { useEffect } from 'react';
import { useWindowStore } from '../store/useWindowStore';
import { isMobileViewport, MOBILE_DOCK_HEIGHT, getViewportSize } from '../core/windowManager/mobileLayout';

/**
 * Mounted once at the app root. Keeps open windows reachable whenever the
 * viewport changes on mobile — resizing the browser or rotating the device.
 * No-ops entirely on desktop, so desktop behavior is untouched.
 */
export function useViewportGuard() {
  const clampToViewport = useWindowStore((s) => s.clampToViewport);

  useEffect(() => {
    let raf = null;

    const handle = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (isMobileViewport()) {
          const { width, height } = getViewportSize();
          clampToViewport(width, height, MOBILE_DOCK_HEIGHT);
        }
      });
    };

    window.addEventListener('resize', handle);
    window.addEventListener('orientationchange', handle);
    // `resize`/`orientationchange` don't reliably fire when a mobile
    // browser's address-bar chrome shows/hides on scroll (no viewport
    // resize event, just a visualViewport change) — listen for that too so
    // a window clamped against the "large" viewport gets re-clamped the
    // moment the visible box shrinks, instead of staying visually clipped.
    window.visualViewport?.addEventListener('resize', handle);

    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('orientationchange', handle);
      window.visualViewport?.removeEventListener('resize', handle);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [clampToViewport]);
}
