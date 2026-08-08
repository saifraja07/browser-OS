import { useCallback, useRef } from 'react';
import { useWindowStore } from '../store/useWindowStore';
import { isMobileViewport, clampWindowToViewport } from '../core/windowManager/mobileLayout';

/**
 * Returns an onPointerDown handler to spread onto a window's title bar.
 * Dragging is disabled while the window is maximized.
 */
export function useWindowDrag(windowId) {
  const dragState = useRef(null);
  const moveWindow = useWindowStore((s) => s.moveWindow);
  const focusWindow = useWindowStore((s) => s.focusWindow);

  const onPointerDown = useCallback(
    (e) => {
      const win = useWindowStore.getState().windows[windowId];
      if (!win || win.isMaximized || !win.draggable) return;
      // Ignore drags started on interactive title-bar controls (close/min/max buttons).
      if (e.target.closest('[data-window-control]')) return;

      focusWindow(windowId);

      dragState.current = {
        pointerId: e.pointerId,
        startPointerX: e.clientX,
        startPointerY: e.clientY,
        startWinX: win.x,
        startWinY: win.y,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [windowId, focusWindow]
  );

  const onPointerMove = useCallback(
    (e) => {
      const drag = dragState.current;
      if (!drag || e.pointerId !== drag.pointerId) return;

      const dx = e.clientX - drag.startPointerX;
      const dy = e.clientY - drag.startPointerY;
      let nextX = drag.startWinX + dx;
      let nextY = Math.max(0, drag.startWinY + dy);

      // Keep the window reachable on mobile: never let it drag fully
      // off-screen or under the dock. Desktop dragging is unaffected.
      if (isMobileViewport()) {
        const win = useWindowStore.getState().windows[windowId];
        if (win) {
          const clamped = clampWindowToViewport(
            { ...win, x: nextX, y: nextY },
            window.innerWidth,
            window.innerHeight
          );
          nextX = clamped.x;
          nextY = clamped.y;
        }
      }

      moveWindow(windowId, nextX, nextY);
    },
    [windowId, moveWindow]
  );

  const onPointerUp = useCallback((e) => {
    if (dragState.current?.pointerId === e.pointerId) {
      dragState.current = null;
    }
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp };
}
