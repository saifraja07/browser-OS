import { create } from 'zustand';
import * as engine from '../core/notifications/notificationEngine';
import { DEFAULT_DURATION_MS } from '../core/notifications/constants';

const timers = new Map(); // id -> setTimeout handle, kept outside state (not serializable)
const ENABLED_KEY = 'browseros:notifications-enabled';

function loadEnabled() {
  try {
    const stored = localStorage.getItem(ENABLED_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

export const useNotificationStore = create((set, get) => ({
  ...engine.createInitialState(),
  enabled: loadEnabled(),

  setEnabled: (enabled) => {
    try {
      localStorage.setItem(ENABLED_KEY, String(enabled));
    } catch {
      // Non-fatal — preference just won't survive a reload.
    }
    set({ enabled });
  },

  add: (input) => {
    if (!get().enabled) return null;

    let newId = null;
    set((state) => {
      const next = engine.addNotification(state, input);
      newId = next.order[next.order.length - 1];
      return next;
    });

    const duration = input.duration ?? DEFAULT_DURATION_MS;
    if (duration > 0) {
      const handle = setTimeout(() => get().dismiss(newId), duration);
      timers.set(newId, handle);
    }
    return newId;
  },

  dismiss: (id) => {
    const handle = timers.get(id);
    if (handle) {
      clearTimeout(handle);
      timers.delete(id);
    }
    set((state) => engine.dismissNotification(state, id));
  },

  clearAll: () => {
    for (const handle of timers.values()) clearTimeout(handle);
    timers.clear();
    set(engine.clearAll);
  },
}));

/**
 * Convenience function for non-component callers (core modules, apps
 * without direct hook access) — equivalent to useNotificationStore.getState().add(...).
 *
 *   notify({ title: 'Upload complete', message: 'resume.pdf saved to /Documents' })
 */
export function notify(input) {
  return useNotificationStore.getState().add(input);
}

export const selectNotificationOrder = (state) => state.order;
export const selectNotification = (id) => (state) => state.notifications[id];
