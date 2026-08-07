import { create } from 'zustand';
import * as wm from '../core/windowManager/windowManager';
import { getApp } from '../core/appRuntime/appRegistry';

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

    let newId = null;
    set((state) => {
      const next = wm.openWindow(state, manifest, options);
      newId = next.focusedId;
      return next;
    });
    return newId;
  },

  closeWindow: (id) => set((state) => wm.closeWindow(state, id)),

  focusWindow: (id) => set((state) => wm.focusWindow(state, id)),

  minimizeWindow: (id) => set((state) => wm.minimizeWindow(state, id)),

  maximizeWindow: (id, workspaceBounds) =>
    set((state) => wm.maximizeWindow(state, id, workspaceBounds)),

  restoreWindow: (id) => set((state) => wm.restoreWindow(state, id)),

  toggleMaximize: (id, workspaceBounds) =>
    set((state) => wm.toggleMaximize(state, id, workspaceBounds)),

  moveWindow: (id, x, y) => set((state) => wm.moveWindow(state, id, x, y)),

  resizeWindow: (id, bounds) => set((state) => wm.resizeWindow(state, id, bounds)),
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
