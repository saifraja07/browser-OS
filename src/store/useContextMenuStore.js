import { create } from 'zustand';

/**
 * Generic context-menu state. Anything (Desktop, a window, a dock item,
 * a file in Explorer later) can call `open(x, y, items)` — this store
 * doesn't know or care who opened it.
 *
 * items: Array<{ id, label, icon?, onSelect, disabled?, hint? }>
 */
export const useContextMenuStore = create((set) => ({
  isOpen: false,
  x: 0,
  y: 0,
  items: [],

  open: (x, y, items) => set({ isOpen: true, x, y, items }),
  close: () => set({ isOpen: false, items: [] }),
}));
