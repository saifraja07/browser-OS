import { create } from 'zustand';
import * as desktopIconEngine from '../core/desktopIcons/desktopIconEngine';
import { DEFAULT_APP_IDS } from '../core/desktopIcons/constants';

export const useDesktopIconStore = create((set, get) => ({
  /** Measured desktop container { width, height, isMobile }. Null until Desktop has been laid out. */
  workspace: null,

  /** Positions the user chose by dragging — the only thing persisted. */
  pins: {},

  /** On-screen positions, derived from workspace + pins. Empty until the workspace is known. */
  icons: {},

  /**
   * Called with the desktop container's measured size (initially, and on every
   * resize). Re-derives positions from the saved pins; the pins themselves are
   * never rewritten here, so shrinking and re-widening the window restores the
   * user's layout. Does nothing if the size is unchanged, and doesn't touch
   * `icons` if the resulting layout is identical — no needless re-renders.
   * Never persists, so resize → state → storage can't feed back on itself.
   */
  setWorkspace: (next) => {
    const { workspace, pins, icons } = get();
    if (
      workspace &&
      workspace.width === next.width &&
      workspace.height === next.height &&
      workspace.isMobile === next.isMobile
    ) {
      return;
    }

    // Desktop and mobile layouts are stored separately — swap pins when the mode flips.
    const modeChanged = !workspace || workspace.isMobile !== next.isMobile;
    const nextPins = modeChanged ? desktopIconEngine.loadPins(next.isMobile) : pins;
    const layout = desktopIconEngine.computeLayout(next, nextPins);

    set({
      workspace: next,
      pins: nextPins,
      icons: desktopIconEngine.areLayoutsEqual(icons, layout) ? icons : layout,
    });
  },

  /** Updates a position in memory only — called continuously during drag. */
  setPosition: (appId, x, y) =>
    set((state) => ({
      icons: { ...state.icons, [appId]: { x, y } },
    })),

  /** Pins the dragged icon where it was dropped and saves — called once, on drag end. */
  commitPositions: (appId) => {
    const { icons, pins, workspace } = get();
    if (!workspace || !icons[appId]) return;

    const nextPins = { ...pins, [appId]: { x: icons[appId].x, y: icons[appId].y } };
    set({ pins: nextPins });
    desktopIconEngine.persistPins(workspace.isMobile, nextPins);
  },
}));

export const selectDesktopAppIds = () => DEFAULT_APP_IDS;
export const selectIconPosition = (appId) => (state) => state.icons[appId];
