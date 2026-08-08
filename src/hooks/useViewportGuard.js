import { useEffect } from 'react';
import { useWindowStore } from '../store/useWindowStore';
import { isMobileViewport, MOBILE_DOCK_HEIGHT } from '../core/windowManager/mobileLayout';

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
          clampToViewport(window.innerWidth, window.innerHeight, MOBILE_DOCK_HEIGHT);
        }
      });
    };

    window.addEventListener('resize', handle);
    window.addEventListener('orientationchange', handle);

    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('orientationchange', handle);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [clampToViewport]);
}
