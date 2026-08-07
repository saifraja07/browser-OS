import { THEMES, THEME_IDS, DEFAULT_THEME_ID, STORAGE_KEY } from './constants';

export function listThemes() {
  return THEME_IDS.map((id) => ({ id, label: THEMES[id].label }));
}

export function getTheme(id) {
  return THEMES[id] ?? THEMES[DEFAULT_THEME_ID];
}

export function getNextThemeId(currentId) {
  const idx = THEME_IDS.indexOf(currentId);
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

export { DEFAULT_THEME_ID };
