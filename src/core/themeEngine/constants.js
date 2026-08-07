export const STORAGE_KEY = 'browseros:theme';
export const DEFAULT_THEME_ID = 'dusk-lavender';

/**
 * Each theme supplies every CSS custom property declared in index.css's
 * @theme block. Tailwind's generated utility classes (bg-os-bg, text-os-ink,
 * etc.) reference these vars indirectly, so re-applying them at runtime
 * re-themes the whole OS live — no component re-render needed.
 */
export const THEMES = {
  'dusk-lavender': {
    label: 'Dusk Lavender',
    vars: {
      '--color-os-bg': '#c9c2e0',
      '--color-os-bg-2': '#b9aed0',
      '--color-os-surface': '#f5f1e8',
      '--color-os-surface-2': '#ede6d6',
      '--color-os-ink': '#2b2438',
      '--color-os-ink-soft': '#5b4f6e',
      '--color-os-accent': '#ff8b5e',
      '--color-os-accent-ink': '#4a1f0b',
      '--color-os-mint': '#6fcf97',
      '--color-os-danger': '#e0607a',
      '--color-os-border': '#b9aed0',
      '--color-os-border-strong': '#2b2438',
    },
  },
  'arcade-mint': {
    label: 'Arcade Mint',
    vars: {
      '--color-os-bg': '#1c1830',
      '--color-os-bg-2': '#14111f',
      '--color-os-surface': '#2a2440',
      '--color-os-surface-2': '#221d38',
      '--color-os-ink': '#eae6f5',
      '--color-os-ink-soft': '#a89fc9',
      '--color-os-accent': '#6fcf97',
      '--color-os-accent-ink': '#0d2b18',
      '--color-os-mint': '#ff8b5e',
      '--color-os-danger': '#ff6b8b',
      '--color-os-border': '#453b6b',
      '--color-os-border-strong': '#eae6f5',
    },
  },
  'sunset-sand': {
    label: 'Sunset Sand',
    vars: {
      '--color-os-bg': '#f0c9a0',
      '--color-os-bg-2': '#e0a878',
      '--color-os-surface': '#fff6e9',
      '--color-os-surface-2': '#fbe8cf',
      '--color-os-ink': '#4a2c1f',
      '--color-os-ink-soft': '#8a5f47',
      '--color-os-accent': '#d84f57',
      '--color-os-accent-ink': '#fff6e9',
      '--color-os-mint': '#3f9b7d',
      '--color-os-danger': '#b8384a',
      '--color-os-border': '#c98a5a',
      '--color-os-border-strong': '#4a2c1f',
    },
  },
};

export const THEME_IDS = Object.keys(THEMES);
