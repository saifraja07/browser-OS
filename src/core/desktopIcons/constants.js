import { MOBILE_BREAKPOINT, MOBILE_DOCK_HEIGHT } from '../windowManager/mobileLayout';

export const STORAGE_KEY = 'browseros:desktop-icons';
export const STORAGE_KEY_MOBILE = 'browseros:desktop-icons:mobile';
/**
 * Persisted shape: `{ v: 2, pins: { [appId]: { x, y } } }`. `pins` holds ONLY icons the
 * user has dragged. Untouched icons are never saved, so they keep following the
 * viewport. Data without `v` is the legacy format (every icon's absolute position).
 */
export const STORAGE_VERSION = 2;

/** Apps that get a persistent desktop shortcut. */
export const LEFT_SHORTCUT_APP_IDS = ['readme', 'settings', 'socials'];
export const RIGHT_SHORTCUT_APP_IDS = ['music', 'community'];
export const DEFAULT_APP_IDS = [...LEFT_SHORTCUT_APP_IDS, ...RIGHT_SHORTCUT_APP_IDS];

export const ICON_SIZE = { width: 76, height: 92 };

/** Same icon, same styling — just sized down to comfortably fit smaller screens. */
export const ICON_SIZE_MOBILE = { width: 58, height: 72 };

/** Keep icons clear of screen edges and the dock. */
export const DESKTOP_PADDING = 20;
/** Extra breathing room below the navbar before desktop shortcuts may be dragged. */
export const DESKTOP_ICON_TOP_RESERVE = 12;
export const DOCK_RESERVE_HEIGHT = 104;
/**
 * Icon footprints (ICON_SIZE*) include padding around the visible icon, and the
 * default mobile column is 2px tighter than its footprint (navbar clamp). Overlap
 * smaller than this is cosmetic padding, not two icons on top of each other.
 */
export const ICON_OVERLAP_TOLERANCE = 4;

/** Reuse the Window Manager's mobile breakpoint/dock reserve so every part of the OS agrees on what "mobile" means. */
export { MOBILE_BREAKPOINT, MOBILE_DOCK_HEIGHT };

export const ROW_GAP = 14;
export const ROW_GAP_MOBILE = 10;
export const COLUMN_GAP = 16;
export const COLUMN_GAP_MOBILE = 10;
