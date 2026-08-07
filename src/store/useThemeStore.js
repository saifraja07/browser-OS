import { create } from 'zustand';
import * as themeEngine from '../core/themeEngine/themeEngine';

export const useThemeStore = create((set, get) => ({
  themeId: themeEngine.loadPersistedThemeId(),

  setTheme: (id) => {
    themeEngine.applyThemeVars(id);
    themeEngine.persistThemeId(id);
    set({ themeId: id });
  },

  cycleTheme: () => {
    const next = themeEngine.getNextThemeId(get().themeId);
    get().setTheme(next);
  },
}));

export const listThemes = themeEngine.listThemes;
