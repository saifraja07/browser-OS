import { THEMES, THEME_IDS, DEFAULT_THEME_ID, STORAGE_KEY } from './constants';
import { getWallpaper } from '../wallpaper/wallpaperEngine';
import {
  CUSTOM_THEME_ID,
  customThemeToVars,
  loadPersistedCustomTheme,
  persistCustomTheme,
  clearPersistedCustomTheme,
  readCustomThemeFile,
} from './customTheme';

// Cached in-memory so getTheme('custom') doesn't hit localStorage on every call.
let cachedCustomTheme = loadPersistedCustomTheme();

export function listThemes() {
  return THEME_IDS.map((id) => ({
    id,
    label: THEMES[id].label,
    description: THEMES[id].description,
    wallpaperId: THEMES[id].wallpaperId,
  }));
}

function getCustomThemeEntry() {
  if (!cachedCustomTheme) return null;
  return { label: cachedCustomTheme.label, vars: customThemeToVars(cachedCustomTheme) };
}

export function getTheme(id) {
  if (id === CUSTOM_THEME_ID) {
    return getCustomThemeEntry() ?? THEMES[DEFAULT_THEME_ID];
  }
  return THEMES[id] ?? THEMES[DEFAULT_THEME_ID];
}

export function getNextThemeId(currentId) {
  const idx = THEME_IDS.indexOf(currentId);
  // Custom theme (or an unknown id) isn't part of the built-in cycle — start from the top.
  if (idx === -1) return THEME_IDS[0];
  return THEME_IDS[(idx + 1) % THEME_IDS.length];
}

/** Writes a theme's CSS variables onto :root. The only DOM mutation in this module. */
export function applyThemeVars(id) {
  const theme = getTheme(id);
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(theme.vars)) {
    root.style.setProperty(prop, value);
  }
}

export function loadPersistedThemeId() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === CUSTOM_THEME_ID) {
      // Only honor a persisted "custom" selection if custom theme data actually exists.
      return cachedCustomTheme ? CUSTOM_THEME_ID : DEFAULT_THEME_ID;
    }
    return stored && THEMES[stored] ? stored : DEFAULT_THEME_ID;
  } catch {
    // localStorage unavailable (private browsing, etc.) — fall back silently.
    return DEFAULT_THEME_ID;
  }
}

export function persistThemeId(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Non-fatal — theme just won't survive a reload.
  }
}

/** [bg, accent, ink] used by Settings to paint a small preview swatch for any theme id. */
export function getThemeSwatchColors(id) {
  const theme = getTheme(id);
  return [theme.vars['--color-os-bg'], theme.vars['--color-os-accent'], theme.vars['--color-os-ink']];
}


export function getThemePreviewStyle(id) {
  const theme = getTheme(id);
  const wallpaperId = theme.wallpaperId;
  if (!wallpaperId) {
    return {
      backgroundImage: `linear-gradient(135deg, ${theme.vars['--color-os-bg']}, ${theme.vars['--color-os-bg-2']})`,
      backgroundSize: '100% 100%',
    };
  }

  const wallpaper = getWallpaper(wallpaperId);
  let backgroundImage = wallpaper.backgroundImage;
  for (const [prop, value] of Object.entries(theme.vars)) {
    const token = prop.replace('--color-os-', '');
    backgroundImage = backgroundImage
      .replaceAll(`var(${prop})`, value)
      .replaceAll(`var(--color-os-${token})`, value);
  }

  return {
    backgroundImage,
    backgroundSize: wallpaper.backgroundSize,
  };
}

export function getThemeMeta(id) {
  const theme = getTheme(id);
  return {
    label: theme.label,
    description: theme.description ?? 'Custom theme',
    wallpaperId: theme.wallpaperId ?? null,
  };
}

export function getCustomTheme() {
  return cachedCustomTheme;
}

/** Validates + persists an uploaded theme file, refreshing the in-memory cache. Throws on invalid input. */
export async function uploadCustomTheme(file) {
  const data = await readCustomThemeFile(file);
  persistCustomTheme(data);
  cachedCustomTheme = data;
  return data;
}

export function removeCustomTheme() {
  clearPersistedCustomTheme();
  cachedCustomTheme = null;
}

export { CUSTOM_THEME_ID, DEFAULT_THEME_ID, THEMES };
