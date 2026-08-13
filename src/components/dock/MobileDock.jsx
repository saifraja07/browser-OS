import { motion } from 'framer-motion';
import { AppIcon } from '../../assets/appIcons';
import { getApp } from '../../core/appRuntime/appRegistry';
import { useWindowStore } from '../../store/useWindowStore';
import { useMobileUIStore } from '../../store/useMobileUIStore';
import { MOBILE_PRIMARY_LEFT_APP, MOBILE_PRIMARY_RIGHT_APP } from './mobileDockConstants';

/**
 * Mobile dock: exactly 3 icons — a primary app on each side, All Apps in
 * the center. A floating pill, same visual language as the desktop dock
 * (pixel-cut border, shadow) just sized down for mobile — and the bar
 * itself is see-through, so the wallpaper shows through behind the icons.
 * Only the bar is transparent; the icon artwork stays fully opaque/legible.
 * Reuses openApp (which already focuses/restores an existing single-instance
 * window instead of duplicating it) and the shared app registry.
 */
export default function MobileDock() {
  const isAllAppsOpen = useMobileUIStore((s) => s.isAllAppsOpen);
  const toggleAllApps = useMobileUIStore((s) => s.toggleAllApps);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.15 }}
      className="os-dock rounded-xl pixel-cut fixed left-1/2 z-(--z-navbar) flex -translate-x-1/2 items-center gap-2 border-(length:--os-border-width) border-os-border-strong bg-os-surface/35 px-3 py-2 backdrop-blur-md shadow-os-window"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      aria-label="Application dock"
    >
      <MobilePrimaryButton appId={MOBILE_PRIMARY_LEFT_APP} />
      <MobileDockButton
        label="All Apps"
        isActive={isAllAppsOpen}
        onClick={toggleAllApps}
        aria-expanded={isAllAppsOpen}
      >
        <AppIcon appId="apps" size={22} alt="" />
      </MobileDockButton>
      <MobilePrimaryButton appId={MOBILE_PRIMARY_RIGHT_APP} />
    </motion.div>
  );
}

function MobilePrimaryButton({ appId }) {
  const manifest = getApp(appId);
  const openApp = useWindowStore((s) => s.openApp);
  const windows = useWindowStore((s) => s.windows);

  if (!manifest) return null;

  const isRunning = Object.values(windows).some((w) => w.appId === appId);
  return (
    <MobileDockButton
      label={manifest.title}
      isRunning={isRunning}
      onClick={() => openApp(appId)}
    >
      <AppIcon appId={appId} size={22} />
    </MobileDockButton>
  );
}

function MobileDockButton({ label, isRunning, onClick, children, ...rest }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="relative flex min-w-13 flex-col items-center gap-1 py-1"
      aria-label={label}
      {...rest}
    >
      <span
        style={{ borderRadius: 'var(--os-icon-radius)' }}
        className={`pixel-cut flex h-9 w-9 items-center justify-center border-(length:--os-border-width) border-os-border-strong shadow-os-window transition-colors ${
          'bg-os-surface/55 text-os-ink'
        }`}
      >
        {children}
      </span>
      <span className="max-w-14 truncate font-display text-[7px] tracking-(--os-display-tracking) text-os-ink-soft">
        {label}
      </span>
      {isRunning ? (
        <span
          className={`absolute -top-0.5 right-3.5 h-1.5 w-1.5 rounded-full ${
            'bg-os-ink-soft'
          }`}
        />
      ) : null}
    </motion.button>
  );
}
