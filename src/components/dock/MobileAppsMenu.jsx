import { getAllApps } from '../../core/appRuntime/appRegistry';
import { useWindowStore } from '../../store/useWindowStore';
import { useMobileUIStore } from '../../store/useMobileUIStore';
import { AppIcon } from '../../assets/appIcons';

/**
 * The center dock button's destination: every registered app in a compact
 * grid that appears right above the dock instantly — no slide/fade
 * transition, no full-screen dimming — a simple popover, not a sheet.
 * Pulls straight from the app registry (getAllApps) — never a hand-rolled
 * list — so new apps show up here automatically.
 */
export default function MobileAppsMenu() {
  const isOpen = useMobileUIStore((s) => s.isAllAppsOpen);
  const close = useMobileUIStore((s) => s.closeAllApps);
  const openApp = useWindowStore((s) => s.openApp);

  if (!isOpen) return null;

  const apps = getAllApps();

  const handleOpenApp = (appId) => {
    openApp(appId);
    close();
  };

  return (
    <>
      {/* Invisible tap-outside-to-close catcher — the wallpaper stays fully
          visible behind the menu, nothing is dimmed or blurred. */}
      <div className="fixed inset-0 z-[var(--z-navbar)]" onClick={close} role="presentation" />

      <div
        className="pixel-cut rounded-[12px] fixed inset-x-6 z-[var(--z-navbar-menu)] max-h-[50vh] overflow-y-auto border-[length:var(--os-border-width)] border-os-border-strong bg-os-surface p-4 shadow-os-window"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--os-dock-height) + 22px)',
        }}
        role="dialog"
        aria-label="All apps"
      >
        <div className="grid grid-cols-3 gap-3">
          {apps.map((app) => {
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => handleOpenApp(app.id)}
                className="flex flex-col items-center gap-1.5 rounded-[var(--os-radius-sm)] p-1.5 active:scale-95"
                aria-label={app.title}
              >
                <span
                  style={{ borderRadius: 'var(--os-icon-radius)' }}
                  className="pixel-cut flex h-11 w-11 items-center justify-center border-[length:var(--os-border-width)] border-os-border-strong bg-os-surface-2 text-os-ink shadow-os-window"
                >
                  <AppIcon appId={app.id} size={26} />
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
