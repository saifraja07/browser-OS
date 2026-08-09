import { DEFAULT_THEME_VARS } from './constants';

/**
 * Writes BrowserOS's single default theme's CSS variables onto :root.
 * The only DOM mutation in this module — called once, on startup.
 */
export function applyDefaultThemeVars() {
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(DEFAULT_THEME_VARS)) {
    root.style.setProperty(prop, value);
  }
}
