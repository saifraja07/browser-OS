/**
 * Height, in px, of the fixed system navbar (components/system/Navbar.jsx).
 * All window positioning here happens in JS pointer/pixel math, so this
 * mirrors the `--os-titlebar-height` CSS variable (index.css /
 * themeEngine/constants.js) rather than reading it live off the DOM.
 * BrowserOS currently ships a single navbar height for both desktop and
 * mobile — keep this in sync if that variable ever changes, and if the two
 * ever diverge, this can become a small lookup keyed on viewport width the
 * same way it's already consumed everywhere below.
 */
export const NAVBAR_HEIGHT = 36;

/**
 * z-index stacking tiers for normal (non-maximized) windows.
 *
 * Normal windows live in the half-open band [Z_INDEX_BASE,
 * Z_INDEX_BASE + Z_INDEX_REBASE_SPAN) and are renumbered back to the start
 * of that band ("rebased") whenever focus/open would push them past it —
 * see rebaseZIndicesIfNeeded in windowManager.js. This keeps window
 * z-indices small and predictable indefinitely (no unbounded growth over a
 * long session) and, crucially, keeps them safely below the navbar tier
 * below at all times.
 *
 * This mirrors the --z-* custom-property scale in index.css:
 *   normal windows      [100, 200)   (this file)
 *   navbar / dock        300         (--z-navbar)
 *   navbar popovers       350         (--z-navbar-menu)
 *   maximized windows    [400, 500)  (this file, Z_MAXIMIZED_BASE)
 *   context menu          600         (--z-context-menu)
 *   notifications         700         (--z-notifications)
 *   boot screen            800         (--z-boot)
 */
export const Z_INDEX_BASE = 100;
export const Z_INDEX_REBASE_SPAN = 100;

/**
 * z-index a MAXIMIZED window renders at: above the navbar (300) and its
 * popovers (350), below transient global overlays (context menu /
 * notifications / boot). There's no CSS variable for this tier — unlike the
 * navbar/dock/overlays, maximized windows are positioned entirely from JS
 * inline styles, so this constant is consumed directly by WindowFrame.jsx,
 * which computes an individual maximized window's actual zIndex as
 * `Z_MAXIMIZED_BASE + (win.zIndex - Z_INDEX_BASE)` — keeping relative
 * front-to-back order between windows consistent whether or not they're
 * maximized.
 */
export const Z_MAXIMIZED_BASE = 400;

export const DEFAULT_WINDOW = {
  x: 120,
  y: 90,
  width: 640,
  height: 440,
};

export const MIN_WINDOW_SIZE = {
  width: 280,
  height: 180,
};

/** Distance in px from a screen/desktop edge that triggers drag-to-snap. */
export const SNAP_THRESHOLD = 16;
