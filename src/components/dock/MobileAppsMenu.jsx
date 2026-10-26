import { getAllApps } from '../../core/appRuntime/appRegistry';
import { useWindowStore } from '../../store/useWindowStore';
import { useMobileUIStore } from '../../store/useMobileUIStore';
import { AppIcon } from '../../assets/appIcons';
import {
  MOBILE_DOCK_BOTTOM_OFFSET,
  MOBILE_DOCK_BODY_HEIGHT,
  MOBILE_APPS_MENU_GAP,
} from './mobileDockConstants';

/**
 * The center dock button's destination: every registered app in a compact
 * grid that appears right above the dock instantly — no slide/fade
 * transition, no full-screen dimming — a simple popover, not a sheet.
 * Pulls straight from the app registry (getAllApps) — never a hand-rolled
 * list — so new apps show up here automatically.
 *
 * Fixed-size card: a set width (capped to the screen on tiny phones) centered
 * over the dock, so it looks the same on phones and tablets instead of
 * stretching edge-to-edge and spreading three icons across the whole screen.
 */
export default function MobileAppsMenu() {
  const isOpen = useMobileUIStore((s) => s.isAllAppsOpen);
  const close = useMobileUIStore((s) => s.closeAllApps);
  const openApp = useWindowStore((s) => s.openApp);

  if (!isOpen) return null;

  // README keeps its desktop shortcut, but is intentionally hidden from
  // the mobile All Apps menu. It remains registered and available elsewhere.
  const apps = getAllApps().filter((app) => app.id !== 'readme');

  const handleOpenApp = (appId) => {
    openApp(appId);
    close();
  };

  return (
    <>
      {/* Invisible tap-outside-to-close catcher — the wallpaper stays fully
          visible behind the menu, nothing is dimmed or blurred. */}
      <div className="fixed inset-0 z-(--z-navbar)" onClick={close} role="presentation" />

      <div
        className="fixed left-1/2 z-(--z-navbar-menu) max-h-[min(20rem,calc(100dvh-10rem))] w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto rounded-[14px] bg-os-surface/70 p-3 shadow-[0_10px_30px_rgba(43,36,56,0.28),inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-xl"
        style={{
          // Sits just above the mobile dock (not the desktop dock height).
          bottom: `calc(env(safe-area-inset-bottom, 0px) + ${
            MOBILE_DOCK_BOTTOM_OFFSET + MOBILE_DOCK_BODY_HEIGHT + MOBILE_APPS_MENU_GAP
          }px)`,
        }}
        role="dialog"
        aria-label="All apps"
      >
        <div className="grid grid-cols-3 gap-1">
          {apps.map((app) => {
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => handleOpenApp(app.id)}
                className="flex flex-col items-center gap-1.5 rounded-(--os-radius-sm) p-1.5 active:scale-95"
                aria-label={app.title}
              >
                <span className="flex h-11 w-11 items-center justify-center text-os-ink">
                  <AppIcon appId={app.id} size={34} />
                </span>
                <span className="line-clamp-2 text-center font-display text-[8px] leading-tight text-os-ink">
                  {app.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
