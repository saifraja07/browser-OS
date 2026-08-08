export const STORAGE_KEY = 'browseros:desktop-icons';

/** Apps that get a persistent desktop shortcut. */
export const DEFAULT_APP_IDS = [
  'readme',
  'calculator',
  'about',
  'explorer',
  'music',
  'settings',
];

export const ICON_SIZE = { width: 76, height: 92 };

/** Keep icons clear of screen edges and the dock at the bottom. */
export const DESKTOP_PADDING = 20;
export const DOCK_RESERVE_HEIGHT = 104;

/** Sensible non-overlapping default layout. */
export const DEFAULT_POSITIONS = {
  readme: { x: 24, y: 24 },
  calculator: { x: 24, y: 120 },
  about: { x: 24, y: 216 },
  explorer: { x: 24, y: 312 },
  music: { x: 24, y: 408 },
  settings: { x: 24, y: 504 },
};
