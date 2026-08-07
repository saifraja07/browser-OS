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

import { DEFAULT_WINDOW, Z_INDEX_BASE, MIN_WINDOW_SIZE } from './constants';

let idCounter = 0;
const generateId = (appId) => `win_${appId}_${Date.now()}_${idCounter++}`;

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
    y: options.y ?? DEFAULT_WINDOW.y + cascadeOffset,
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
  const win = state.windows[id];
  if (!win) return state;
  if (state.focusedId === id && win.zIndex === state.nextZIndex - 1 && !win.isMinimized) {
    return state; // already focused and on top — no-op
  }

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
      [id]: { ...win, ...bounds, isMaximized: false, prevBounds: null },
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
  return { ...state, windows: { ...state.windows, [id]: { ...win, x, y } } };
}

/** Updates a window's size and position (called continuously during resize). */
export function resizeWindow(state, id, bounds) {
  const win = state.windows[id];
  if (!win || win.isMaximized || !win.resizable) return state;

  const width = Math.max(win.minWidth, bounds.width);
  const height = Math.max(win.minHeight, bounds.height);

  return {
    ...state,
    windows: {
      ...state.windows,
      [id]: { ...win, x: bounds.x, y: bounds.y, width, height },
    },
  };
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
