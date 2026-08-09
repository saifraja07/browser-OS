import { create } from 'zustand';
import * as wm from '../core/windowManager/windowManager';
import { getApp } from '../core/appRuntime/appRegistry';
import { isMobileViewport, getMobileWindowBounds } from '../core/windowManager/mobileLayout';

export const useWindowStore = create((set, get) => ({
  ...wm.createInitialState(),

  /** Opens an app by id. If the app is single-instance and already open, focuses it instead. */
  openApp: (appId, options = {}) => {
    const manifest = getApp(appId);
    if (!manifest) {
      console.error(`[useWindowStore] No app registered with id "${appId}".`);
      return null;
    }

    if (manifest.singleInstance) {
      const existing = Object.values(get().windows).find((w) => w.appId === appId);
      if (existing) {
        get().focusWindow(existing.id);
        return existing.id;
      }
    }

    // On mobile, position/size new windows to fit the viewport instead of
    // inheriting desktop-oriented default bounds. Explicit `options` (if any
    // caller ever passes them) still win over the computed mobile bounds.
    let finalOptions = options;
    if (typeof window !== 'undefined' && isMobileViewport()) {
      const mobileBounds = getMobileWindowBounds({
        manifest,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });
      finalOptions = { ...mobileBounds, ...options };
    }

    let newId = null;
    set((state) => {
      const next = wm.openWindow(state, manifest, finalOptions);
      newId = next.focusedId;
      return next;
    });
    return newId;
  },

  closeWindow: (id) => set((state) => wm.closeWindow(state, id)),

  /** Closes the currently open window for an app id. Useful for app-level
   * commands such as the Terminal's `exit`, without exposing window ids to
   * the app itself. */
  closeApp: (appId) => {
    const windows = get().windows;
    const target = Object.values(windows).find((win) => win.appId === appId);
    if (!target) return false;

    set((state) => wm.closeWindow(state, target.id));
    return true;
  },

  focusWindow: (id) => set((state) => wm.focusWindow(state, id)),

  minimizeWindow: (id) => set((state) => wm.minimizeWindow(state, id)),

  maximizeWindow: (id, workspaceBounds) =>
    set((state) => wm.maximizeWindow(state, id, workspaceBounds)),

  restoreWindow: (id) => set((state) => wm.restoreWindow(state, id)),

  toggleMaximize: (id, workspaceBounds) =>
    set((state) => wm.toggleMaximize(state, id, workspaceBounds)),

  moveWindow: (id, x, y) => set((state) => wm.moveWindow(state, id, x, y)),

  resizeWindow: (id, bounds) => set((state) => wm.resizeWindow(state, id, bounds)),

  /** Clamps all windows into the given viewport (mobile resize/orientation-change guard). */
  clampToViewport: (viewportWidth, viewportHeight, dockReserve) =>
    set((state) => wm.clampWindowsToViewport(state, viewportWidth, viewportHeight, dockReserve)),
}));

// --- Selectors -------------------------------------------------------------
// Keep components subscribed to the smallest slice they need so one window
// changing never re-renders the whole desktop.

export const selectWindowIds = (state) => Object.keys(state.windows);
export const selectWindow = (id) => (state) => state.windows[id];
export const selectFocusedId = (state) => state.focusedId;
export const selectIsFocused = (id) => (state) => state.focusedId === id;
export const selectTaskbarEntries = (state) =>
  Object.values(state.windows).map((w) => ({
    id: w.id,
    appId: w.appId,
    title: w.title,
    icon: w.icon,
    isMinimized: w.isMinimized,
    isFocused: state.focusedId === w.id,
  }));
