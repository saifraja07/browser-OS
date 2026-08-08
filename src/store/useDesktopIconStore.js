import { create } from 'zustand';
import * as desktopIconEngine from '../core/desktopIcons/desktopIconEngine';
import { DEFAULT_APP_IDS } from '../core/desktopIcons/constants';

export const useDesktopIconStore = create((set, get) => ({
  icons: desktopIconEngine.loadPositions(),

  /** Updates a position in memory only — called continuously during drag. */
  setPosition: (appId, x, y) =>
    set((state) => ({
      icons: { ...state.icons, [appId]: { x, y } },
    })),

  /** Writes current positions to storage — called once, on drag end. */
  commitPositions: () => {
    desktopIconEngine.persistPositions(get().icons);
  },
}));

export const selectDesktopAppIds = () => DEFAULT_APP_IDS;
export const selectIconPosition = (appId) => (state) => state.icons[appId];
