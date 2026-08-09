/**
 * Core Window Manager engine.
 *
 * This module owns ALL window lifecycle logic: open, close, focus, drag,
 * resize, minimize, maximize, restore, and z-index ordering.
 *
 * It is intentionally framework-agnostic — no React, no Zustand — so it can
 * be unit-tested in isolation and swapped out without touching any UI code.
 * `store/useWindowStore.js` is the only place that imports this module and
 * wires it into React-reactive state.
 *
 * State shape (owned by the caller, passed in and returned — never mutated):
 *
 * {
 *   windows: {
 *     [windowId]: {
 *       id, appId, title, icon,
 *       x, y, width, height,
 *       minWidth, minHeight,
 *       isMinimized, isMaximized,
 *       prevBounds: { x, y, width, height } | null, // restored on un-maximize
 *       zIndex,
 *       resizable, draggable,
 *     }
 *   },
 *   focusedId: windowId | null,
 *   nextZIndex: number,
 * }
 */

import {
  DEFAULT_WINDOW,
  Z_INDEX_BASE,
  Z_INDEX_REBASE_SPAN,
  MIN_WINDOW_SIZE,
  NAVBAR_HEIGHT,
} from './constants';
import { clampWindowToViewport } from './mobileLayout';

let idCounter = 0;
const generateId = (appId) => `win_${appId}_${Date.now()}_${idCounter++}`;

/**
 * Clamps a normal (non-maximized) window's top edge to never sit above the
 * navbar, so its title bar — and the close/minimize/maximize controls on
 * it — can never be covered by the navbar. Used everywhere a normal
 * window's y is set: open, drag, resize, and restore-from-maximize.
 */
const clampNormalY = (y) => Math.max(NAVBAR_HEIGHT, y);

/**
 * Normal-window z-indices are kept in a small, predictable band (see
 * Z_INDEX_BASE / Z_INDEX_REBASE_SPAN in constants.js) so they can never
 * grow tall enough, over a long session of opening/focusing windows, to
 * collide with the navbar or maximized-window tiers above them. Whenever
 * the running counter would leave that band, renumber every window
 * sequentially — preserving their existing relative front-to-back order —
 * and reset the counter back to the start of the band.
 */
function rebaseZIndicesIfNeeded(state) {
  if (state.nextZIndex < Z_INDEX_BASE + Z_INDEX_REBASE_SPAN) return state;

  const ordered = Object.values(state.windows).sort((a, b) => a.zIndex - b.zIndex);
  const windows = { ...state.windows };
  ordered.forEach((win, i) => {
    windows[win.id] = { ...win, zIndex: Z_INDEX_BASE + i };
  });

  return { ...state, windows, nextZIndex: Z_INDEX_BASE + ordered.length };
}

/** Creates an empty, initial window-manager state. */
export function createInitialState() {
  return {
    windows: {},
    focusedId: null,
    nextZIndex: Z_INDEX_BASE,
  };
}

/**
 * Opens a new window for the given app manifest.
 * @param {object} state - current window-manager state
 * @param {object} manifest - app manifest from appRuntime (id, title, icon, defaultSize, minSize, resizable)
 * @param {object} [options] - optional overrides (x, y, width, height, props)
 */
export function openWindow(state, manifest, options = {}) {
  state = rebaseZIndicesIfNeeded(state);

  const id = generateId(manifest.id);
  const zIndex = state.nextZIndex;

  const width = options.width ?? manifest.defaultSize?.width ?? DEFAULT_WINDOW.width;
  const height = options.height ?? manifest.defaultSize?.height ?? DEFAULT_WINDOW.height;

  // Cascade new windows slightly so they don't stack exactly on top of each other.
  const openCount = Object.keys(state.windows).length;
  const cascadeOffset = (openCount % 8) * 24;

  const win = {
    id,
    appId: manifest.id,
    title: options.title ?? manifest.title,
    icon: manifest.icon ?? null,
    x: options.x ?? DEFAULT_WINDOW.x + cascadeOffset,
    // A normal window must always open below the navbar, never underneath it.
    y: clampNormalY(options.y ?? DEFAULT_WINDOW.y + cascadeOffset),
    width,
    height,
    minWidth: manifest.minSize?.width ?? MIN_WINDOW_SIZE.width,
    minHeight: manifest.minSize?.height ?? MIN_WINDOW_SIZE.height,
    isMinimized: false,
    isMaximized: false,
    prevBounds: null,
    zIndex,
    resizable: manifest.resizable ?? true,
    draggable: manifest.draggable ?? true,
    props: options.props ?? {},
  };

  return {
    ...state,
    windows: { ...state.windows, [id]: win },
    focusedId: id,
    nextZIndex: zIndex + 1,
  };
}

/** Closes and removes a window entirely. */
export function closeWindow(state, id) {
  if (!state.windows[id]) return state;
  const { [id]: removed, ...rest } = state.windows;

  let focusedId = state.focusedId;
  if (focusedId === id) {
    focusedId = getTopMostId(rest);
  }

  return { ...state, windows: rest, focusedId };
}

/** Brings a window to the front and marks it focused. Restores it if minimized. */
export function focusWindow(state, id) {
  const winBefore = state.windows[id];
  if (!winBefore) return state;
  if (state.focusedId === id && winBefore.zIndex === state.nextZIndex - 1 && !winBefore.isMinimized) {
    return state; // already focused and on top — no-op
  }

  state = rebaseZIndicesIfNeeded(state);
  const win = state.windows[id]; // may have been renumbered by the rebase above

  const zIndex = state.nextZIndex;
  return {
    ...state,
    windows: {
      ...state.windows,
      [id]: { ...win, zIndex, isMinimized: false },
    },
    focusedId: id,
    nextZIndex: zIndex + 1,
  };
}

/** Minimizes a window (hides it, loses focus, does not close). */
export function minimizeWindow(state, id) {
  const win = state.windows[id];
  if (!win) return state;

  const focusedId = state.focusedId === id ? getTopMostId(state.windows, id) : state.focusedId;

  return {
    ...state,
    windows: { ...state.windows, [id]: { ...win, isMinimized: true } },
    focusedId,
  };
}

/** Maximizes a window to fill the workspace, remembering prior bounds for restore. */
export function maximizeWindow(state, id, workspaceBounds) {
  const win = state.windows[id];
  if (!win || win.isMaximized) return state;

  const prevBounds = { x: win.x, y: win.y, width: win.width, height: win.height };

  return {
    ...state,
    windows: {
      ...state.windows,
      [id]: {
        ...win,
        prevBounds,
        isMaximized: true,
        isMinimized: false,
        x: workspaceBounds.x,
        y: workspaceBounds.y,
        width: workspaceBounds.width,
        height: workspaceBounds.height,
      },
    },
  };
}

/** Restores a maximized window to its bounds prior to maximizing. */
export function restoreWindow(state, id) {
  const win = state.windows[id];
  if (!win || !win.isMaximized) return state;

  const bounds = win.prevBounds ?? {
    x: DEFAULT_WINDOW.x,
    y: DEFAULT_WINDOW.y,
    width: DEFAULT_WINDOW.width,
    height: DEFAULT_WINDOW.height,
  };

  return {
    ...state,
    windows: {
      ...state.windows,
      // Clamp y defensively: prevBounds was valid when it was saved, but the
      // viewport (or navbar height) may have changed since. Restoring must
      // never place the title bar behind the navbar.
      [id]: { ...win, ...bounds, y: clampNormalY(bounds.y), isMaximized: false, prevBounds: null },
    },
  };
}

/** Toggles between maximize and restore. */
export function toggleMaximize(state, id, workspaceBounds) {
  const win = state.windows[id];
  if (!win) return state;
  return win.isMaximized
    ? restoreWindow(state, id)
    : maximizeWindow(state, id, workspaceBounds);
}

/** Updates a window's position (called continuously during drag). */
export function moveWindow(state, id, x, y) {
  const win = state.windows[id];
  if (!win || win.isMaximized || !win.draggable) return state;
  // Defense-in-depth: useWindowDrag already stops the title bar at the
  // navbar, but the store is the single source of truth, so it clamps too.
  return { ...state, windows: { ...state.windows, [id]: { ...win, x, y: clampNormalY(y) } } };
}

/** Updates a window's size and position (called continuously during resize). */
export function resizeWindow(state, id, bounds) {
  const win = state.windows[id];
  if (!win || win.isMaximized || !win.resizable) return state;

  const width = Math.max(win.minWidth, bounds.width);
  const height = Math.max(win.minHeight, bounds.height);
  // Defense-in-depth: useWindowResize already compensates height when the
  // top ('n') handle hits the navbar, but the store clamps too so no
  // caller can push a normal window's title bar behind the navbar.
  const y = clampNormalY(bounds.y);

  return {
    ...state,
    windows: {
      ...state.windows,
      [id]: { ...win, x: bounds.x, y, width, height },
    },
  };
}

/**
 * Clamps every window's bounds into the given viewport (mobile only — see
 * mobileLayout.js). Called on resize/orientation-change so a window can
 * never end up permanently off-screen or hidden behind the mobile dock.
 */
export function clampWindowsToViewport(state, viewportWidth, viewportHeight, dockReserve) {
  const windows = {};
  for (const [id, win] of Object.entries(state.windows)) {
    windows[id] = clampWindowToViewport(win, viewportWidth, viewportHeight, dockReserve);
  }
  return { ...state, windows };
}

/** Returns the id of the highest z-index, non-minimized window, excluding `excludeId`. */
function getTopMostId(windows, excludeId = null) {
  let topId = null;
  let topZ = -Infinity;
  for (const win of Object.values(windows)) {
    if (win.id === excludeId || win.isMinimized) continue;
    if (win.zIndex > topZ) {
      topZ = win.zIndex;
      topId = win.id;
    }
  }
  return topId;
}

export const __internal = { getTopMostId };
