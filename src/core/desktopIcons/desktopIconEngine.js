import {
  STORAGE_KEY,
  STORAGE_KEY_MOBILE,
  DEFAULT_APP_IDS,
  DEFAULT_POSITIONS,
  DEFAULT_POSITIONS_MOBILE,
  ICON_SIZE,
  ICON_SIZE_MOBILE,
  DESKTOP_PADDING,
  DOCK_RESERVE_HEIGHT,
  MOBILE_BREAKPOINT,
  MOBILE_DOCK_HEIGHT,
} from './constants';

function isMobileViewport() {
  return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
}

/** The icon footprint in effect for the current viewport — same icon, smaller on mobile. */
export function getIconSize() {
  return isMobileViewport() ? ICON_SIZE_MOBILE : ICON_SIZE;
}

function getDockReserveHeight() {
  return isMobileViewport() ? MOBILE_DOCK_HEIGHT : DOCK_RESERVE_HEIGHT;
}

function getStorageKey() {
  return isMobileViewport() ? STORAGE_KEY_MOBILE : STORAGE_KEY;
}

function getDefaultPositions() {
  return isMobileViewport() ? DEFAULT_POSITIONS_MOBILE : DEFAULT_POSITIONS;
}

/** Keeps a position inside the usable desktop area (clear of edges and the dock). */
export function clampToDesktop(x, y) {
  const size = getIconSize();
  const dockReserve = getDockReserveHeight();
  const maxX = Math.max(DESKTOP_PADDING, window.innerWidth - size.width - DESKTOP_PADDING);
  const maxY = Math.max(DESKTOP_PADDING, window.innerHeight - size.height - dockReserve);
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
 *
 * Mobile and desktop keep separate storage keys — a phone's compact
 * single-column layout and a desktop's spread-out layout aren't
 * interchangeable, so saving one shouldn't clobber the other.
 */
export function loadPositions() {
  const positions = { ...getDefaultPositions() };

  try {
    const stored = localStorage.getItem(getStorageKey());
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
    localStorage.setItem(getStorageKey(), JSON.stringify(positions));
  } catch {
    // Non-fatal — positions just won't survive a reload.
  }
}
