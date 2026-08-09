import wallpaper1 from '../../assets/wallpaper/wallpaper1.webp';
import wallpaper2 from '../../assets/wallpaper/wallpaper2.webp';
import wallpaper3 from '../../assets/wallpaper/wallpaper3.webp';
import wallpaper4 from '../../assets/wallpaper/wallpaper4.webp';
import wallpaper5 from '../../assets/wallpaper/wallpaper5.webp';
import wallpaper6 from '../../assets/wallpaper/wallpaper6.webp';
import wallpaper7 from '../../assets/wallpaper/wallpaper7.webp';

export const STORAGE_KEY = 'browseros:wallpaper';

/** Selected when the active wallpaper is a user-uploaded image rather than a built-in. */
export const CUSTOM_WALLPAPER_ID = 'custom';

/**
 * The 7 built-in wallpapers BrowserOS ships with — the single source of
 * truth for built-in wallpaper data. Every component that needs a
 * wallpaper's image or label reads it from here rather than hardcoding
 * paths of its own.
 */
export const WALLPAPERS = [
  { id: 'wallpaper-1', label: 'Wallpaper 1', image: wallpaper1 },
  { id: 'wallpaper-2', label: 'Wallpaper 2', image: wallpaper2 },
  { id: 'wallpaper-3', label: 'Wallpaper 3', image: wallpaper3 },
  { id: 'wallpaper-4', label: 'Wallpaper 4', image: wallpaper4 },
  { id: 'wallpaper-5', label: 'Wallpaper 5', image: wallpaper5 },
  { id: 'wallpaper-6', label: 'Wallpaper 6', image: wallpaper6 },
  { id: 'wallpaper-7', label: 'Wallpaper 7', image: wallpaper7 },
];

export const WALLPAPER_IDS = WALLPAPERS.map((w) => w.id);

/** Always used as the safe fallback — on first launch and whenever a saved id is invalid. */
export const DEFAULT_WALLPAPER_ID = WALLPAPER_IDS[0];
