import { pixelCut } from './constants';

/**
 * Custom (user-uploaded) theme support.
 *
 * Uploaded files are plain JSON describing a color palette + a handful of
 * numeric shape values — never markup, never a URL, never a script. We
 * whitelist every key we read and validate every value ourselves before it
 * ever touches the DOM (via CSSStyleDeclaration.setProperty, which cannot
 * execute anything). This keeps the feature safe without needing to sanitize
 * arbitrary CSS or ban specific substrings.
 *
 * The parsed+validated result is small (a dozen colors + four numbers), so
 * it lives in localStorage like the rest of BrowserOS's lightweight
 * settings — no IndexedDB needed unless a future version starts accepting
 * larger assets (background images, fonts, etc.), at which point the
 * existing VirtualFS storageDriver pattern (idb) is the place to add it.
 */

export const CUSTOM_THEME_ID = 'custom';
export const CUSTOM_THEME_STORAGE_KEY = 'browseros:customTheme';

/** Plain-JSON theme files are tiny (colors + a few numbers) — 12KB is already generous. */
export const CUSTOM_THEME_MAX_BYTES = 12 * 1024;

const COLOR_KEYS = [
  'bg',
  'bg2',
  'surface',
  'surface2',
  'ink',
  'inkSoft',
  'accent',
  'accentInk',
  'mint',
  'danger',
  'border',
  'borderStrong',
];

const CSS_VAR_BY_COLOR_KEY = {
  bg: '--color-os-bg',
  bg2: '--color-os-bg-2',
  surface: '--color-os-surface',
  surface2: '--color-os-surface-2',
  ink: '--color-os-ink',
  inkSoft: '--color-os-ink-soft',
  accent: '--color-os-accent',
  accentInk: '--color-os-accent-ink',
  mint: '--color-os-mint',
  danger: '--color-os-danger',
  border: '--color-os-border',
  borderStrong: '--color-os-border-strong',
};

// [min, max, default]
const SHAPE_FIELDS = {
  radiusWindow: [0, 40, 12],
  radiusSm: [0, 24, 8],
  borderWidth: [1, 6, 2],
  cornerCut: [0, 16, 4],
};

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
const RGB_RE = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/;

function isValidColor(value) {
  return typeof value === 'string' && (HEX_RE.test(value) || RGB_RE.test(value));
}

function clampNumber(value, [min, max, fallback]) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function sanitizeLabel(value) {
  if (typeof value !== 'string') return 'Custom Theme';
  const cleaned = value.trim().replace(/[^\w\s-]/g, '');
  return cleaned.slice(0, 40) || 'Custom Theme';
}

/**
 * Validates a parsed JSON payload against the theme schema.
 * Throws a descriptive Error on the first problem found — never silently
 * accepts a malformed/unsafe theme.
 */
export function validateCustomThemeData(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Theme file must be a JSON object.');
  }
  if (!raw.colors || typeof raw.colors !== 'object' || Array.isArray(raw.colors)) {
    throw new Error('Theme file is missing a "colors" object.');
  }

  const colors = {};
  for (const key of COLOR_KEYS) {
    const value = raw.colors[key];
    if (!isValidColor(value)) {
      throw new Error(`"colors.${key}" must be a hex or rgb()/rgba() color.`);
    }
    colors[key] = value;
  }

  const shapeIn = raw.shape && typeof raw.shape === 'object' && !Array.isArray(raw.shape) ? raw.shape : {};
  const shape = {};
  for (const [field, limits] of Object.entries(SHAPE_FIELDS)) {
    shape[field] = clampNumber(shapeIn[field], limits);
  }

  return { label: sanitizeLabel(raw.label), colors, shape };
}

/** Turns validated custom-theme data into the same {label, vars} shape built-in THEMES use. */
export function customThemeToVars(data) {
  const vars = {};
  for (const key of COLOR_KEYS) {
    vars[CSS_VAR_BY_COLOR_KEY[key]] = data.colors[key];
  }
  vars['--os-radius-window'] = `${data.shape.radiusWindow}px`;
  vars['--os-radius-sm'] = `${data.shape.radiusSm}px`;
  vars['--os-border-width'] = `${data.shape.borderWidth}px`;
  vars['--os-clip-corner'] = pixelCut(data.shape.cornerCut);
  // Custom themes only ever get generic (computed) texture/shadow/tracking —
  // never raw CSS strings from the uploaded file — so there's no surface
  // for a crafted background-image or box-shadow value to smuggle anything.
  vars['--os-window-texture'] = 'none';
  vars['--os-window-texture-size'] = 'auto';
  vars['--os-display-tracking'] = '0.05em';
  vars['--os-titlebar-height'] = '36px';
  vars['--os-dock-height'] = '64px';
  vars['--os-dock-gap'] = '10px';
  vars['--os-icon-size'] = '44px';
  vars['--os-icon-radius'] = '8px';
  vars['--os-ui-opacity'] = '0.94';
  vars['--shadow-os-window'] = '0 10px 0 rgba(0, 0, 0, 0.16), 0 16px 26px rgba(0, 0, 0, 0.24)';
  vars['--shadow-os-window-focused'] = `0 10px 0 ${data.colors.accent}88, 0 18px 30px rgba(0, 0, 0, 0.3)`;
  return vars;
}

export function readCustomThemeFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected.'));
      return;
    }
    const looksLikeJson = file.type === 'application/json' || file.type === '' || file.name.toLowerCase().endsWith('.json');
    if (!looksLikeJson) {
      reject(new Error('Theme file must be a .json file.'));
      return;
    }
    if (file.size > CUSTOM_THEME_MAX_BYTES) {
      reject(new Error(`Theme file is too large (max ${Math.round(CUSTOM_THEME_MAX_BYTES / 1024)}KB).`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the theme file.'));
    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch {
        reject(new Error('Theme file is not valid JSON.'));
        return;
      }
      try {
        resolve(validateCustomThemeData(parsed));
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
}

export function loadPersistedCustomTheme() {
  try {
    const stored = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
    if (!stored) return null;
    // Re-validate on load too — defends against a hand-edited localStorage value.
    return validateCustomThemeData(JSON.parse(stored));
  } catch {
    return null;
  }
}

export function persistCustomTheme(data) {
  try {
    localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Non-fatal — the theme just won't survive a reload.
  }
}

export function clearPersistedCustomTheme() {
  try {
    localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
  } catch {
    // Non-fatal.
  }
}
