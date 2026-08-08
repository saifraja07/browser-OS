import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { getAllApps } from '../../core/appRuntime/appRegistry';
import { useWindowStore } from '../../store/useWindowStore';
import { useMobileUIStore } from '../../store/useMobileUIStore';
import { DESKTOP_LOGOS } from '../desktop/desktopLogos';

/**
 * The center dock button's destination: a grid of every registered app.
 * Pulls straight from the app registry (getAllApps) — never a hand-rolled
 * list — so new apps show up here automatically.
 */
export default function MobileAppsMenu() {
  const isOpen = useMobileUIStore((s) => s.isAllAppsOpen);
  const close = useMobileUIStore((s) => s.closeAllApps);
  const openApp = useWindowStore((s) => s.openApp);

  const apps = getAllApps();

  const handleOpenApp = (appId) => {
    openApp(appId);
    close();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-9999 bg-os-ink/40 backdrop-blur-[2px]"
          onClick={close}
          role="presentation"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="pixel-cut absolute inset-x-0 bottom-0 max-h-[72vh] overflow-y-auto border-t-[length:var(--os-border-width)] border-os-border-strong bg-os-surface px-4 pt-3"
            style={{
              paddingBottom: 'calc(var(--os-dock-height) + env(safe-area-inset-bottom, 0px) + 12px)',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="All apps"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[13px] tracking-[var(--os-display-tracking)] text-os-ink">
                All Apps
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="pixel-cut flex h-7 w-7 items-center justify-center border-[length:var(--os-border-width)] border-os-border-strong bg-os-surface-2 text-os-ink"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 pb-2">
              {apps.map((app) => {
                const Icon = DESKTOP_LOGOS[app.id] ?? app.icon;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleOpenApp(app.id)}
                    className="flex flex-col items-center gap-1.5 rounded-[var(--os-radius-sm)] p-1.5 active:scale-95"
                    aria-label={app.title}
                  >
                    <span className="pixel-cut os-icon-shell flex items-center justify-center border-[length:var(--os-border-width)] border-os-border-strong bg-os-surface-2 text-os-ink shadow-os-window">
                      {Icon ? <Icon size={28} className="h-7 w-7" /> : null}
                    </span>
                    <span className="line-clamp-2 text-center font-display text-[8px] leading-tight text-os-ink">
                      {app.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
