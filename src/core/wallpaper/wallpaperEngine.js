import { WALLPAPERS, WALLPAPER_IDS, DEFAULT_WALLPAPER_ID, STORAGE_KEY } from './constants';

export function listWallpapers() {
  return WALLPAPER_IDS.map((id) => ({ id, label: WALLPAPERS[id].label }));
}

export function getWallpaper(id) {
  return WALLPAPERS[id] ?? WALLPAPERS[DEFAULT_WALLPAPER_ID];
}

export function loadPersistedWallpaperId() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && WALLPAPERS[stored] ? stored : DEFAULT_WALLPAPER_ID;
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
