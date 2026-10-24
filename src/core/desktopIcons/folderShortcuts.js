/**
 * Desktop-only shortcuts that are NOT apps: they have no window, aren't in
 * the app registry, and therefore never show up in the dock or the mobile
 * All Apps menu. Clicking one runs its own action instead of openApp().
 *
 * The icon artwork for each lives in components/desktop/desktopLogos.jsx.
 */
export const FOLDER_SHORTCUTS = {
  socials: { id: 'socials', title: 'My Socials' },
};
