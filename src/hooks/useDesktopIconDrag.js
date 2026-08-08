import { useCallback, useRef } from 'react';
import { useDesktopIconStore } from '../store/useDesktopIconStore';
import { clampToDesktop } from '../core/desktopIcons/desktopIconEngine';

/** Pointer movement, in px, before a press is treated as a drag instead of a click. */
const DRAG_THRESHOLD = 4;

/**
 * Returns pointer handlers for a draggable desktop icon.
 *
 * A press that ends without crossing DRAG_THRESHOLD is a click and calls
 * onOpen(). A press that moves past the threshold becomes a drag: the icon
 * follows the pointer (clamped to the desktop area) and its final position
 * is persisted once, on release — never on every pointermove.
 */
export function useDesktopIconDrag(appId, onOpen) {
  const dragState = useRef(null);
  const setPosition = useDesktopIconStore((s) => s.setPosition);
  const commitPositions = useDesktopIconStore((s) => s.commitPositions);

  const onPointerDown = useCallback(
    (e) => {
      const icon = useDesktopIconStore.getState().icons[appId];
      if (!icon) return;

      dragState.current = {
        pointerId: e.pointerId,
        startPointerX: e.clientX,
        startPointerY: e.clientY,
        startIconX: icon.x,
        startIconY: icon.y,
        moved: false,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [appId]
  );

  const onPointerMove = useCallback(
    (e) => {
      const drag = dragState.current;
      if (!drag || e.pointerId !== drag.pointerId) return;

      const dx = e.clientX - drag.startPointerX;
      const dy = e.clientY - drag.startPointerY;

      if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      drag.moved = true;

      const next = clampToDesktop(drag.startIconX + dx, drag.startIconY + dy);
      setPosition(appId, next.x, next.y);
    },
    [appId, setPosition]
  );

  const endDrag = useCallback(
    (e) => {
      const drag = dragState.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      dragState.current = null;

      if (drag.moved) {
        commitPositions();
      } else {
        onOpen();
      }
    },
    [commitPositions, onOpen]
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };
}
