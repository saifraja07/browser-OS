import { MOBILE_BREAKPOINT, MOBILE_DOCK_HEIGHT } from '../windowManager/mobileLayout';

export const STORAGE_KEY = 'browseros:desktop-icons';
export const STORAGE_KEY_MOBILE = 'browseros:desktop-icons:mobile';

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

/** Same icon, same styling — just sized down to comfortably fit smaller screens. */
export const ICON_SIZE_MOBILE = { width: 60, height: 72 };

/** Keep icons clear of screen edges and the dock at the bottom. */
export const DESKTOP_PADDING = 20;
export const DOCK_RESERVE_HEIGHT = 104;

/** Reuse the Window Manager's mobile breakpoint/dock reserve so every part of the OS agrees on what "mobile" means. */
export { MOBILE_BREAKPOINT, MOBILE_DOCK_HEIGHT };

/** Sensible non-overlapping default layout. */
export const DEFAULT_POSITIONS = {
  readme: { x: 24, y: 24 },
  calculator: { x: 24, y: 120 },
  about: { x: 24, y: 216 },
  explorer: { x: 24, y: 312 },
  music: { x: 24, y: 408 },
  settings: { x: 24, y: 504 },
};

const MOBILE_ROW_GAP = 14;

/**
 * Same single-column order as desktop, just spaced for the smaller mobile
 * icon size so all default apps fit without overlapping even on short
 * viewports.
 */
export const DEFAULT_POSITIONS_MOBILE = DEFAULT_APP_IDS.reduce((positions, appId, index) => {
  positions[appId] = {
    x: DESKTOP_PADDING,
    y: DESKTOP_PADDING + index * (ICON_SIZE_MOBILE.height + MOBILE_ROW_GAP),
  };
  return positions;
}, {});
