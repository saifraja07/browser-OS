import { WALLPAPERS, WALLPAPER_IDS, DEFAULT_WALLPAPER_ID, CUSTOM_WALLPAPER_ID, STORAGE_KEY } from './constants';

export function listWallpapers() {
  return WALLPAPERS;
}

export function getBuiltInWallpaper(id) {
  return WALLPAPERS.find((w) => w.id === id) ?? null;
}

/**
 * Reads the persisted wallpaper preference. Falls back to the default id
 * for anything invalid — nothing saved yet, an unrecognized id, or a
 * previously saved built-in wallpaper that no longer exists. "custom" is
 * passed through as-is; the caller is responsible for verifying the actual
 * uploaded image still exists in IndexedDB before trusting it.
 */
export function loadPersistedWallpaperId() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === CUSTOM_WALLPAPER_ID) return CUSTOM_WALLPAPER_ID;
    return stored && WALLPAPER_IDS.includes(stored) ? stored : DEFAULT_WALLPAPER_ID;
  } catch {
    return DEFAULT_WALLPAPER_ID;
  }
}

export function persistWallpaperId(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Non-fatal — selection just won't survive a reload.
  }
}

export { DEFAULT_WALLPAPER_ID, CUSTOM_WALLPAPER_ID };
