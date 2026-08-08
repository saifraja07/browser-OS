import {
  STORAGE_KEY,
  DEFAULT_APP_IDS,
  DEFAULT_POSITIONS,
  ICON_SIZE,
  DESKTOP_PADDING,
  DOCK_RESERVE_HEIGHT,
} from './constants';

/** Keeps a position inside the usable desktop area (clear of edges and the dock). */
export function clampToDesktop(x, y) {
  const maxX = Math.max(DESKTOP_PADDING, window.innerWidth - ICON_SIZE.width - DESKTOP_PADDING);
  const maxY = Math.max(
    DESKTOP_PADDING,
    window.innerHeight - ICON_SIZE.height - DOCK_RESERVE_HEIGHT
  );
  return {
    x: Math.min(Math.max(x, DESKTOP_PADDING), maxX),
    y: Math.min(Math.max(y, DESKTOP_PADDING), maxY),
  };
}

/**
 * Loads persisted icon positions, merged over the defaults so any app that
 * doesn't have a saved position yet (new install, or a default icon added
 * later) still gets a sensible spot. Positions are clamped in case the
 * viewport is smaller than when they were saved.
 */
export function loadPositions() {
  const positions = { ...DEFAULT_POSITIONS };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      for (const appId of DEFAULT_APP_IDS) {
        const saved = parsed?.[appId];
        if (typeof saved?.x === 'number' && typeof saved?.y === 'number') {
          positions[appId] = { x: saved.x, y: saved.y };
        }
      }
    }
  } catch {
    // localStorage unavailable or corrupt — fall back to defaults silently.
  }

  for (const appId of DEFAULT_APP_IDS) {
    positions[appId] = clampToDesktop(positions[appId].x, positions[appId].y);
  }

  return positions;
}

export function persistPositions(positions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // Non-fatal — positions just won't survive a reload.
  }
}
