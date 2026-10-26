import {
  STORAGE_KEY,
  STORAGE_KEY_MOBILE,
  STORAGE_VERSION,
  LEFT_SHORTCUT_APP_IDS,
  RIGHT_SHORTCUT_APP_IDS,
  DEFAULT_APP_IDS,
  ICON_SIZE,
  ICON_SIZE_MOBILE,
  ICON_OVERLAP_TOLERANCE,
  ROW_GAP,
  ROW_GAP_MOBILE,
  COLUMN_GAP,
  COLUMN_GAP_MOBILE,
  DESKTOP_PADDING,
  DESKTOP_ICON_TOP_RESERVE,
  DOCK_RESERVE_HEIGHT,
  MOBILE_DOCK_HEIGHT,
} from './constants';
import { NAVBAR_HEIGHT } from '../windowManager/constants';

/**
 * Desktop icon layout engine — pure functions, no `window`/DOM reads.
 *
 * Everything here works from a `workspace` = { width, height, isMobile }: the
 * measured size of the desktop container (see useDesktopWorkspace). Layout is
 * therefore always derived from the *current* workspace, never from whatever
 * the viewport happened to be when the module loaded.
 *
 * Model:
 *  - "pins"  = positions the user chose by dragging (persisted).
 *  - Every other icon has no stored position; it sits in its default slot,
 *    which is recomputed from the workspace (the right-hand group hugs the
 *    right edge, so it follows the viewport as it grows/shrinks).
 *  - computeLayout(workspace, pins) merges the two into on-screen positions.
 */

const clamp = (value, lo, hi) => Math.min(Math.max(value, lo), hi);

function getMetrics(isMobile) {
  return isMobile
    ? {
        size: ICON_SIZE_MOBILE,
        rowGap: ROW_GAP_MOBILE,
        columnGap: COLUMN_GAP_MOBILE,
        dockReserve: MOBILE_DOCK_HEIGHT,
        storageKey: STORAGE_KEY_MOBILE,
      }
    : {
        size: ICON_SIZE,
        rowGap: ROW_GAP,
        columnGap: COLUMN_GAP,
        dockReserve: DOCK_RESERVE_HEIGHT,
        storageKey: STORAGE_KEY,
      };
}

/**
 * Usable icon area: clear of the edges, the navbar and the dock. Shortcuts
 * may never sit above the protected row directly below the navbar (this is
 * the same `minY` the drag clamp has always used).
 */
function getBounds(workspace) {
  const { size, dockReserve } = getMetrics(workspace.isMobile);
  const minY = NAVBAR_HEIGHT + DESKTOP_PADDING + DESKTOP_ICON_TOP_RESERVE;
  return {
    minX: DESKTOP_PADDING,
    maxX: Math.max(DESKTOP_PADDING, workspace.width - size.width - DESKTOP_PADDING),
    minY,
    // Never let a very short workspace push icons up under the navbar.
    maxY: Math.max(minY, workspace.height - size.height - dockReserve),
  };
}

/** Keeps a position inside the usable desktop area (clear of edges, navbar and dock). */
export function clampToDesktop(x, y, workspace) {
  const { minX, maxX, minY, maxY } = getBounds(workspace);
  return { x: clamp(x, minX, maxX), y: clamp(y, minY, maxY) };
}

/**
 * Where an unpinned icon sits by default: left group stacked top-to-bottom at
 * the left edge, right group in a single row hugging the *current* right edge.
 * Same arrangement as before — only now derived from the live workspace.
 */
function getDefaultPosition(appId, workspace) {
  const { size, rowGap, columnGap } = getMetrics(workspace.isMobile);
  const top = NAVBAR_HEIGHT + DESKTOP_PADDING;

  const leftIndex = LEFT_SHORTCUT_APP_IDS.indexOf(appId);
  if (leftIndex !== -1) {
    return clampToDesktop(DESKTOP_PADDING, top + leftIndex * (size.height + rowGap), workspace);
  }

  const count = RIGHT_SHORTCUT_APP_IDS.length;
  const rowWidth = count * size.width + (count - 1) * columnGap;
  const startX = Math.max(DESKTOP_PADDING, workspace.width - DESKTOP_PADDING - rowWidth);
  const index = Math.max(0, RIGHT_SHORTCUT_APP_IDS.indexOf(appId));
  return clampToDesktop(startX + index * (size.width + columnGap), top, workspace);
}

function overlaps(a, b, size) {
  return (
    Math.abs(a.x - b.x) < size.width - ICON_OVERLAP_TOLERANCE &&
    Math.abs(a.y - b.y) < size.height - ICON_OVERLAP_TOLERANCE
  );
}

/**
 * Nearest collision-free grid slot to `preferred` (columns counted from both
 * the left and the right edge, so a right-hugging icon can step left, a
 * left-hugging one can step right). Returns null if the workspace is full.
 */
function findFreeSlot(preferred, placed, workspace) {
  const { size, rowGap, columnGap } = getMetrics(workspace.isMobile);
  const { minX, maxX, minY, maxY } = getBounds(workspace);
  const stepX = size.width + columnGap;
  const stepY = size.height + rowGap;

  const xs = [];
  for (let x = minX; x <= maxX; x += stepX) xs.push(x);
  for (let x = maxX; x >= minX; x -= stepX) xs.push(x);

  let best = null;
  let bestDistance = Infinity;
  for (let y = minY; y <= maxY; y += stepY) {
    for (const x of xs) {
      const candidate = { x, y };
      if (placed.some((p) => overlaps(p, candidate, size))) continue;
      const distance = (x - preferred.x) ** 2 + (y - preferred.y) ** 2;
      if (distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    }
  }
  return best;
}

/**
 * Resolves every desktop icon's on-screen position for `workspace`.
 *
 *  1. A pin that already fits the workspace is kept verbatim — a user's
 *     custom placement is never touched while it is valid.
 *  2. A pin that no longer fits is clamped into the workspace (its saved
 *     value is left alone elsewhere, so widening again restores it).
 *  3. Unpinned icons take their default slot for this workspace.
 *  4. Anything displaced in (2)/(3) that would land on top of another icon
 *     is moved to the nearest free slot. Valid pins always win; icons the
 *     user deliberately stacked together are not "fixed".
 */
export function computeLayout(workspace, pins = {}) {
  const { size } = getMetrics(workspace.isMobile);
  const resolved = {};
  const stable = [];
  const displacedPins = [];
  const unpinned = [];

  for (const appId of DEFAULT_APP_IDS) {
    const pin = pins[appId];
    if (pin) {
      const fitted = clampToDesktop(pin.x, pin.y, workspace);
      if (fitted.x === pin.x && fitted.y === pin.y) {
        resolved[appId] = fitted;
        stable.push(fitted);
      } else {
        displacedPins.push({ appId, position: fitted });
      }
    } else {
      unpinned.push({ appId, position: getDefaultPosition(appId, workspace) });
    }
  }

  const placed = [...stable];
  for (const { appId, position } of [...displacedPins, ...unpinned]) {
    const final = placed.some((p) => overlaps(p, position, size))
      ? (findFreeSlot(position, placed, workspace) ?? position)
      : position;
    resolved[appId] = final;
    placed.push(final);
  }

  // Stable key order (DEFAULT_APP_IDS) regardless of which bucket an icon fell in.
  return DEFAULT_APP_IDS.reduce((layout, appId) => {
    layout[appId] = resolved[appId];
    return layout;
  }, {});
}

export function areLayoutsEqual(a, b) {
  return DEFAULT_APP_IDS.every((id) => a?.[id]?.x === b?.[id]?.x && a?.[id]?.y === b?.[id]?.y);
}

const isPoint = (p) => Number.isFinite(p?.x) && Number.isFinite(p?.y);

function pickPins(source) {
  const pins = {};
  for (const appId of DEFAULT_APP_IDS) {
    if (isPoint(source?.[appId])) pins[appId] = { x: source[appId].x, y: source[appId].y };
  }
  return pins;
}

/**
 * Legacy data (no `v`) stored EVERY icon's absolute position, including icons
 * the user never moved — that is how a stale right-edge x from a wide window
 * got frozen into storage. Entries still sitting on their default row/column
 * are therefore treated as "not customised" and dropped; everything else is
 * kept as a pin. (The right-hand group's x can't be verified because the
 * viewport it was saved at is unknown, so being on the default row is the
 * signal.) Deterministic and viewport-independent, so it's safe to re-run on
 * every load until the next drag writes the new format.
 */
function migrateLegacyPins(parsed, isMobile) {
  const { size, rowGap } = getMetrics(isMobile);
  const top = NAVBAR_HEIGHT + DESKTOP_PADDING;
  const minY = top + DESKTOP_ICON_TOP_RESERVE;

  const pins = {};
  for (const [appId, saved] of Object.entries(pickPins(parsed))) {
    const leftIndex = LEFT_SHORTCUT_APP_IDS.indexOf(appId);
    const isLeft = leftIndex !== -1;
    const defaultY = Math.max(minY, top + (isLeft ? leftIndex : 0) * (size.height + rowGap));
    const atDefault = saved.y === defaultY && (!isLeft || saved.x === DESKTOP_PADDING);
    if (!atDefault) pins[appId] = saved;
  }
  return pins;
}

/** Loads the user's pinned icon positions for the given layout mode. */
export function loadPins(isMobile) {
  try {
    const stored = localStorage.getItem(getMetrics(isMobile).storageKey);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (parsed?.v === STORAGE_VERSION) return pickPins(parsed.pins);
    return migrateLegacyPins(parsed, isMobile);
  } catch {
    // localStorage unavailable or corrupt — fall back to default placement silently.
    return {};
  }
}

/**
 * Mobile and desktop keep separate storage keys — a phone's compact layout
 * and a desktop's spread-out layout aren't interchangeable.
 */
export function persistPins(isMobile, pins) {
  try {
    localStorage.setItem(
      getMetrics(isMobile).storageKey,
      JSON.stringify({ v: STORAGE_VERSION, pins })
    );
  } catch {
    // Non-fatal — positions just won't survive a reload.
  }
}
