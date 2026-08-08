import { create } from 'zustand';
import * as themeEngine from '../core/themeEngine/themeEngine';
import { useWallpaperStore } from './useWallpaperStore';

export const useThemeStore = create((set, get) => ({
  themeId: themeEngine.loadPersistedThemeId(),
  customTheme: themeEngine.getCustomTheme(),

  setTheme: (id) => {
    themeEngine.applyThemeVars(id);
    themeEngine.persistThemeId(id);
    const theme = themeEngine.getTheme(id);

    // Preset themes behave like complete desktop "skins": selecting one also
    // selects its matching wallpaper. Users can still override the wallpaper
    // afterwards from the Wallpaper app.
    if (theme.wallpaperId) {
      useWallpaperStore.getState().setWallpaper(theme.wallpaperId);
    }

    set({ themeId: id });
  },

  cycleTheme: () => {
    const next = themeEngine.getNextThemeId(get().themeId);
    get().setTheme(next);
  },

  /** Validates + persists an uploaded theme file, then switches to it. Rejects with a user-facing message on failure. */
  uploadCustomTheme: async (file) => {
    const data = await themeEngine.uploadCustomTheme(file);
    set({ customTheme: data });
    get().setTheme(themeEngine.CUSTOM_THEME_ID);
    return data;
  },

  removeCustomTheme: () => {
    themeEngine.removeCustomTheme();
    set({ customTheme: null });
    // Falling back to the default keeps the OS themed even if "custom" was active.
    if (get().themeId === themeEngine.CUSTOM_THEME_ID) {
      get().setTheme(themeEngine.DEFAULT_THEME_ID);
    }
  },
}));

export const listThemes = themeEngine.listThemes;
export const getThemeSwatchColors = themeEngine.getThemeSwatchColors;
export const getThemePreviewStyle = themeEngine.getThemePreviewStyle;
export const CUSTOM_THEME_ID = themeEngine.CUSTOM_THEME_ID;
