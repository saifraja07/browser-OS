import { create } from 'zustand';

/**
 * Tracks which single navbar system menu/panel is currently open — the
 * BrowserOS favicon menu, or the Wi-Fi/Battery/Date & Time panels. Kept as
 * one store (rather than a boolean per control) so opening any one of them
 * always closes whichever other one was open, mirroring how the window
 * manager tracks a single focused window.
 */
export const useSystemBarStore = create((set) => ({
  /** null | 'browseros' | 'wifi' | 'battery' | 'time' | 'system-info' | 'licenses' | 'shutdown' | 'clear-site-data-confirm' */
  activeMenu: null,

  toggleMenu: (id) => set((state) => ({ activeMenu: state.activeMenu === id ? null : id })),
  closeMenu: () => set({ activeMenu: null }),
}));
