import { create } from 'zustand';
import * as wallpaperEngine from '../core/wallpaper/wallpaperEngine';

export const useWallpaperStore = create((set) => ({
  wallpaperId: wallpaperEngine.loadPersistedWallpaperId(),

  setWallpaper: (id) => {
    wallpaperEngine.persistWallpaperId(id);
    set({ wallpaperId: id });
  },
}));

export const listWallpapers = wallpaperEngine.listWallpapers;
export const getWallpaper = wallpaperEngine.getWallpaper;
