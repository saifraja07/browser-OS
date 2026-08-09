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

export function isMobileViewport(width = getViewportSize().width) {
  return width < MOBILE_BREAKPOINT;
}

/**
 * Reads the actual CSS-rendered viewport box (`<html>`'s clientWidth/
 * clientHeight), which is what `html`'s `100dvh` sizing in index.css
 * resolves to. This is deliberately used instead of `window.innerWidth/
 * innerHeight` for every window-positioning calculation below: on some
 * mobile browsers `window.innerHeight` reports the "large" viewport (as if
 * the address-bar chrome were hidden) even while the on-screen box is
 * actually the smaller `dvh` box, which was causing tall single-instance
 * windows (Music, Calculator) to be positioned partially outside the
 * Desktop's visible, `overflow-hidden` area and appear "hidden" on mobile.
 * Reading the live DOM box here keeps JS bounds math and the actual
 * rendered viewport permanently in agreement.
 */
export function getViewportSize() {
  if (typeof document !== 'undefined' && document.documentElement) {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };
  }
  if (typeof window !== 'undefined') {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  return { width: 0, height: 0 };
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
 * Clamps an existing window's bounds into the current viewport. Used
 * continuously while dragging on mobile, so a window being actively
 * dragged can still be pushed right up to an edge (leaving just
 * MIN_VISIBLE reachable, like normal window-manager drag behavior) without
 * being yanked back to center mid-drag.
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

/**
 * Re-fits an existing window into a *new* viewport size — used specifically
 * when the viewport itself resizes (desktop window shrunk to mobile width,
 * device rotated, mobile browser chrome show/hide), NOT during interactive
 * dragging (see clampWindowToViewport above for that).
 *
 * A window's x/y is usually authored for a desktop-sized viewport (e.g.
 * cascaded open positions starting around x:120). Naively edge-clamping
 * that position into a much narrower mobile viewport — the same way
 * clampWindowToViewport does for drag — can leave most of the window
 * hanging off the right/bottom edge, which reads as "the app disappeared".
 * Fixed, non-resizable apps like Music/Calculator are hit hardest since
 * they can't be manually resized back into view afterward.
 *
 * So here: if the window already fits fully inside the new viewport as-is,
 * leave it exactly where the user last placed it. Only reposition it when
 * it genuinely no longer fits — then re-center it the same way a freshly
 * opened mobile window is centered (see getMobileWindowBounds), so it's
 * fully visible and still freely draggable afterward.
 */
export function fitWindowToViewport(
  win,
  viewportWidth,
  viewportHeight,
  dockReserve = MOBILE_DOCK_HEIGHT
) {
  if (win.isMaximized) return win;

  const maxWidth = Math.max(MIN_DIMENSION, viewportWidth - MARGIN * 2);
  const maxHeight = Math.max(MIN_DIMENSION, viewportHeight - dockReserve - NAVBAR_HEIGHT - MARGIN * 2);

  // Resizable windows keep their current (possibly user-resized) size and
  // only ever shrink here if they no longer fit — we don't second-guess a
  // deliberate manual resize. Non-resizable windows (e.g. Music,
  // Calculator) have no other way to adapt, so they scale continuously off
  // their authored "natural" size instead: shrinking when the viewport
  // gets tighter and growing back toward that natural size the moment more
  // room reappears (rotating to landscape, widening the browser, etc.) —
  // i.e. actually resizing alongside the window, not just repositioning.
  const naturalWidth = win.resizable ? win.width : (win.defaultWidth ?? win.width);
  const naturalHeight = win.resizable ? win.height : (win.defaultHeight ?? win.height);

  const width = Math.min(naturalWidth, maxWidth);
  const height = Math.min(naturalHeight, maxHeight);

  const fitsHorizontally = win.x >= 0 && win.x + width <= viewportWidth;
  const x = fitsHorizontally
    ? win.x
    : Math.max(MARGIN, Math.round((viewportWidth - width) / 2));

  const fitsVertically = win.y >= NAVBAR_HEIGHT && win.y + height <= viewportHeight - dockReserve;
  const maxY = Math.max(NAVBAR_HEIGHT, viewportHeight - dockReserve - height);
  const y = fitsVertically ? win.y : Math.min(Math.max(win.y, NAVBAR_HEIGHT), maxY);

  return { ...win, x, y, width, height };
}
