import { NAVBAR_HEIGHT } from '../windowManager/constants';
import { MOBILE_BREAKPOINT, MOBILE_DOCK_HEIGHT } from '../windowManager/mobileLayout';

export const STORAGE_KEY = 'browseros:desktop-icons';
export const STORAGE_KEY_MOBILE = 'browseros:desktop-icons:mobile';

/** Apps that get a persistent desktop shortcut. */
export const LEFT_SHORTCUT_APP_IDS = ['readme', 'settings', 'explorer'];
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

/** Reuse the Window Manager's mobile breakpoint/dock reserve so every part of the OS agrees on what "mobile" means. */
export { MOBILE_BREAKPOINT, MOBILE_DOCK_HEIGHT };

const ROW_GAP = 14;
const ROW_GAP_MOBILE = 10;
const COLUMN_GAP = 16;
const COLUMN_GAP_MOBILE = 10;

function viewportWidth() {
  return typeof window !== 'undefined' ? window.innerWidth : 1280;
}

/** Left group's default: stacked top-to-bottom, hugging the left edge, starting just below the navbar. */
function buildLeftDefaults(size, rowGap) {
  return LEFT_SHORTCUT_APP_IDS.reduce((positions, appId, index) => {
    positions[appId] = {
      x: DESKTOP_PADDING,
      y: NAVBAR_HEIGHT + DESKTOP_PADDING + index * (size.height + rowGap),
    };
    return positions;
  }, {});
}

/** Right group's default: a single row hugging the right edge, starting just below the navbar. */
function buildRightDefaults(size, columnGap) {
  const totalWidth =
    RIGHT_SHORTCUT_APP_IDS.length * size.width + (RIGHT_SHORTCUT_APP_IDS.length - 1) * columnGap;
  const startX = Math.max(DESKTOP_PADDING, viewportWidth() - DESKTOP_PADDING - totalWidth);

  return RIGHT_SHORTCUT_APP_IDS.reduce((positions, appId, index) => {
    positions[appId] = {
      x: startX + index * (size.width + columnGap),
      y: NAVBAR_HEIGHT + DESKTOP_PADDING,
    };
    return positions;
  }, {});
}

/**
 * Sensible non-overlapping default layout — left column, right row, same
 * shape as the shortcut bar this grew out of — but every icon is freely
 * draggable from there, exactly like the rest of BrowserOS's desktop icons.
 */
export const DEFAULT_POSITIONS = {
  ...buildLeftDefaults(ICON_SIZE, ROW_GAP),
  ...buildRightDefaults(ICON_SIZE, COLUMN_GAP),
};

/** Same left-column/right-row shape, just spaced for the smaller mobile icon size. */
export const DEFAULT_POSITIONS_MOBILE = {
  ...buildLeftDefaults(ICON_SIZE_MOBILE, ROW_GAP_MOBILE),
  ...buildRightDefaults(ICON_SIZE_MOBILE, COLUMN_GAP_MOBILE),
};
