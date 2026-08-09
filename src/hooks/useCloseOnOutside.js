import { useEffect } from 'react';

/**
 * Closes whatever `ref` wraps on an outside pointerdown or Escape while
 * `active`. Same pattern ContextMenu already uses for the desktop/file
 * right-click menu — extracted here so every navbar control (BrowserOS
 * menu, Wi-Fi, Battery, Date & Time) shares one implementation instead of
 * four hand-rolled listeners.
 */
export function useCloseOnOutside(ref, active, onClose) {
  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    // Skip the pointerdown that opened the control.
    const raf = requestAnimationFrame(() => {
      window.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('keydown', handleKeyDown);
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, onClose, ref]);
}
