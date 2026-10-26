import { useLayoutEffect, useRef } from 'react';
import { useDesktopIconStore } from '../store/useDesktopIconStore';

/**
 * Measures the desktop container and keeps the icon store in sync with it.
 * Returns the ref to attach to the Desktop root element.
 *
 * The container is observed directly (ResizeObserver) rather than listening to
 * `window.resize`, so every way its box can change is covered: window resize,
 * DevTools docked to the side or bottom, orientation change, dvh changes.
 *
 * The first measurement happens synchronously in a layout effect, i.e. before
 * the browser paints, so icons are never drawn at a stale or placeholder spot.
 * One observer exists at a time; it's disconnected on unmount / mode change.
 */
export function useDesktopWorkspace(isMobile) {
  const ref = useRef(null);
  const setWorkspace = useDesktopIconStore((s) => s.setWorkspace);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const measure = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      // Not laid out yet (e.g. display:none) — wait for a real size.
      if (width > 0 && height > 0) setWorkspace({ width, height, isMobile });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile, setWorkspace]);

  return ref;
}
