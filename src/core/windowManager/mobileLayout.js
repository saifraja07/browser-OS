/**
 * Mobile layout helpers for the Window Manager.
 *
 * Framework-agnostic (no React) — mirrors windowManager.js's philosophy so
 * these can be unit-tested and reused from both the store and the drag hooks.
 *
 * These helpers never *enforce* a minimum size the way desktop resize does;
 * on mobile, fitting inside the viewport (no horizontal/vertical overflow)
 * always wins over an app's desktop-oriented `minSize`.
 */

import { NAVBAR_HEIGHT } from './constants';

/** Below this viewport width, BrowserOS switches to the mobile layout. */
export const MOBILE_BREAKPOINT = 768;

/** Approximate height reserved for the mobile dock (bar + safe-area breathing room). */
export const MOBILE_DOCK_HEIGHT = 84;

/** Minimum px of a window that must remain reachable/visible on-screen. */
const MIN_VISIBLE = 56;

/** Absolute floor so a window never collapses to nothing on a tiny viewport. */
const MIN_DIMENSION = 160;

const MARGIN = 8;

export function isMobileViewport(width = typeof window !== 'undefined' ? window.innerWidth : 0) {
  return width < MOBILE_BREAKPOINT;
}

/**
 * Computes viewport-safe bounds for a newly-opened window on mobile.
 * Centers the window horizontally, pins it near the top, and never lets it
 * exceed the available viewport (minus dock + margins).
 */
export function getMobileWindowBounds({
  manifest,
  viewportWidth,
  viewportHeight,
  dockReserve = MOBILE_DOCK_HEIGHT,
}) {
  const maxWidth = Math.max(MIN_DIMENSION, viewportWidth - MARGIN * 2);
  // Reserve navbar space at the top so a freshly-opened window's title bar
  // never starts out underneath it.
  const maxHeight = Math.max(MIN_DIMENSION, viewportHeight - dockReserve - NAVBAR_HEIGHT - MARGIN * 2);

  const desiredWidth = manifest.defaultSize?.width ?? maxWidth;
  const desiredHeight = manifest.defaultSize?.height ?? maxHeight;

  const width = Math.min(desiredWidth, maxWidth);
  const height = Math.min(desiredHeight, maxHeight);

  const x = Math.max(MARGIN, Math.round((viewportWidth - width) / 2));
  const y = NAVBAR_HEIGHT + MARGIN;

  return { x, y, width, height };
}

/**
 * Clamps an existing window's bounds into the current viewport. Used on
 * viewport resize/orientation-change and continuously while dragging on
 * mobile, so a window can never end up fully off-screen or under the dock.
 */
export function clampWindowToViewport(
  win,
  viewportWidth,
  viewportHeight,
  dockReserve = MOBILE_DOCK_HEIGHT
) {
  if (win.isMaximized) return win;

  const maxWidth = Math.max(MIN_DIMENSION, viewportWidth - MARGIN * 2);
  const maxHeight = Math.max(MIN_DIMENSION, viewportHeight - dockReserve - NAVBAR_HEIGHT - MARGIN * 2);

  const width = Math.min(win.width, maxWidth);
  const height = Math.min(win.height, maxHeight);

  const maxX = viewportWidth - MIN_VISIBLE;
  const minX = -(width - MIN_VISIBLE);
  const x = Math.min(Math.max(win.x, minX), Math.max(minX, maxX));

  // Never let a window's title bar rest above the navbar, even after a
  // resize/orientation-change forces this clamp to run.
  const maxY = Math.max(NAVBAR_HEIGHT, viewportHeight - dockReserve - MIN_VISIBLE);
  const y = Math.min(Math.max(win.y, NAVBAR_HEIGHT), maxY);

  return { ...win, x, y, width, height };
}
