import { create } from 'zustand';
import * as wallpaperEngine from '../core/wallpaper/wallpaperEngine';
import * as customWallpaperStorage from '../core/wallpaper/customWallpaperStorage';
import { WALLPAPERS, DEFAULT_WALLPAPER_ID, CUSTOM_WALLPAPER_ID } from '../core/wallpaper/constants';

const persistedId = wallpaperEngine.loadPersistedWallpaperId();
const startsAsCustom = persistedId === CUSTOM_WALLPAPER_ID;

export const useWallpaperStore = create((set, get) => ({
  // While a persisted "custom" selection is still being loaded from
  // IndexedDB, show the default built-in wallpaper rather than a blank
  // background — the moment the blob resolves (or fails), this flips to
  // its final value. See hydration below.
  wallpaperId: startsAsCustom ? DEFAULT_WALLPAPER_ID : persistedId,
  customWallpaperUrl: null,

  /** Selects one of the 7 built-in wallpapers. */
  setWallpaper: (id) => {
    wallpaperEngine.persistWallpaperId(id);
    set({ wallpaperId: id });
  },

  /** Validates, persists, and immediately applies an uploaded image as the active wallpaper. */
  uploadWallpaper: async (file) => {
    await customWallpaperStorage.saveCustomWallpaper(file);

    const prevUrl = get().customWallpaperUrl;
    const url = URL.createObjectURL(file);
    if (prevUrl) URL.revokeObjectURL(prevUrl);

    wallpaperEngine.persistWallpaperId(CUSTOM_WALLPAPER_ID);
    set({ wallpaperId: CUSTOM_WALLPAPER_ID, customWallpaperUrl: url });
    return url;
  },

  /** Clears the uploaded wallpaper and safely falls back to the default built-in. */
  removeCustomWallpaper: async () => {
    await customWallpaperStorage.clearCustomWallpaper();
    const prevUrl = get().customWallpaperUrl;
    if (prevUrl) URL.revokeObjectURL(prevUrl);

    wallpaperEngine.persistWallpaperId(DEFAULT_WALLPAPER_ID);
    set({ wallpaperId: DEFAULT_WALLPAPER_ID, customWallpaperUrl: null });
  },
}));

// One-time async hydration on module load: if the persisted preference was
// "custom", fetch the actual blob from IndexedDB and swap in its object
// URL. If it's missing or corrupted, fall back safely to the default
// wallpaper instead of leaving the OS on a dead "custom" selection.
if (startsAsCustom) {
  customWallpaperStorage
    .loadCustomWallpaper()
    .then((record) => {
      if (record?.blob) {
        const url = URL.createObjectURL(record.blob);
        useWallpaperStore.setState({ wallpaperId: CUSTOM_WALLPAPER_ID, customWallpaperUrl: url });
      } else {
        wallpaperEngine.persistWallpaperId(DEFAULT_WALLPAPER_ID);
        // wallpaperId is already DEFAULT_WALLPAPER_ID from initial state — nothing else to change.
      }
    })
    .catch(() => {
      wallpaperEngine.persistWallpaperId(DEFAULT_WALLPAPER_ID);
    });
}

export function listWallpapers() {
  return WALLPAPERS;
}

/** Resolves a wallpaper store state to the actual image URL the Desktop should render. */
export function getActiveWallpaperSrc(state) {
  if (state.wallpaperId === CUSTOM_WALLPAPER_ID && state.customWallpaperUrl) {
    return state.customWallpaperUrl;
  }
  const builtIn =
    WALLPAPERS.find((w) => w.id === state.wallpaperId) ?? WALLPAPERS.find((w) => w.id === DEFAULT_WALLPAPER_ID);
  return builtIn.image;
}

export { DEFAULT_WALLPAPER_ID, CUSTOM_WALLPAPER_ID };
