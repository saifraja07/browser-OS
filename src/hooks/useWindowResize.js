import { useCallback, useRef } from 'react';
import { useWindowStore } from '../store/useWindowStore';
import { NAVBAR_HEIGHT } from '../core/windowManager/constants';

/**
 * Returns an onPointerDown handler for a resize handle positioned at `direction`
 * (one of: n, s, e, w, ne, nw, se, sw).
 */
export function useWindowResize(windowId, direction) {
  const resizeState = useRef(null);
  const resizeWindow = useWindowStore((s) => s.resizeWindow);
  const focusWindow = useWindowStore((s) => s.focusWindow);

  const onPointerDown = useCallback(
    (e) => {
      e.stopPropagation();
      const win = useWindowStore.getState().windows[windowId];
      if (!win || win.isMaximized || !win.resizable) return;

      focusWindow(windowId);

      resizeState.current = {
        pointerId: e.pointerId,
        startPointerX: e.clientX,
        startPointerY: e.clientY,
        startBounds: { x: win.x, y: win.y, width: win.width, height: win.height },
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [windowId, focusWindow]
  );

  const onPointerMove = useCallback(
    (e) => {
      const resize = resizeState.current;
      if (!resize || e.pointerId !== resize.pointerId) return;

      const dx = e.clientX - resize.startPointerX;
      const dy = e.clientY - resize.startPointerY;
      const { x, y, width, height } = resize.startBounds;

      let next = { x, y, width, height };

      if (direction.includes('e')) next.width = width + dx;
      if (direction.includes('s')) next.height = height + dy;
      if (direction.includes('w')) {
        next.width = width - dx;
        next.x = x + dx;
      }
      if (direction.includes('n')) {
        // Stop the top edge at the navbar. Compensate height by the actual
        // (possibly clamped) delta so the bottom edge doesn't jump when the
        // clamp kicks in.
        const nextY = Math.max(NAVBAR_HEIGHT, y + dy);
        next.height = height + (y - nextY);
        next.y = nextY;
      }

      resizeWindow(windowId, next);
    },
    [windowId, direction, resizeWindow]
  );

  const onPointerUp = useCallback((e) => {
    if (resizeState.current?.pointerId === e.pointerId) {
      resizeState.current = null;
    }
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp };
}
