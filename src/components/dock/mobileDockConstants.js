/**
 * The two "primary" apps pinned to the left/right of the mobile dock,
 * flanking the center All Apps button. Picked from the existing app
 * registry — Terminal and Messages are the apps most likely to be
 * reached for on a phone-sized BrowserOS.
 */
export const MOBILE_PRIMARY_LEFT_APP = 'terminal';
export const MOBILE_PRIMARY_RIGHT_APP = 'messages';

/** Distance from the bottom of the screen to the bottom of the mobile dock (px, before safe-area inset). */
export const MOBILE_DOCK_BOTTOM_OFFSET = 12;
/** Rendered height of the mobile dock pill (px). */
export const MOBILE_DOCK_BODY_HEIGHT = 79;
/** Breathing room between the dock and the All Apps popup above it (px). */
export const MOBILE_APPS_MENU_GAP = 10;
