import { create } from 'zustand';

/**
 * Tiny UI-only store for the mobile "All Apps" menu's open/closed state.
 * Kept separate from useWindowStore since this has nothing to do with
 * window lifecycle — it's just a sheet toggle.
 */
export const useMobileUIStore = create((set) => ({
  isAllAppsOpen: false,
  openAllApps: () => set({ isAllAppsOpen: true }),
  closeAllApps: () => set({ isAllAppsOpen: false }),
  toggleAllApps: () => set((s) => ({ isAllAppsOpen: !s.isAllAppsOpen })),
}));
