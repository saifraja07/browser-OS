import { create } from 'zustand';

/** Open/closed state of the My Socials popup (a desktop-only folder, not a window). */
export const useSocialsStore = create((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
}));
