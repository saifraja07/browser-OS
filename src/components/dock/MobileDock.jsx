import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { getApp } from '../../core/appRuntime/appRegistry';
import { useWindowStore } from '../../store/useWindowStore';
import { useMobileUIStore } from '../../store/useMobileUIStore';
import { DESKTOP_LOGOS } from '../desktop/desktopLogos';
import { MOBILE_PRIMARY_LEFT_APP, MOBILE_PRIMARY_RIGHT_APP } from './mobileDockConstants';

/**
 * Mobile dock: exactly 3 icons — a primary app on each side, All Apps in
 * the center. Reuses openApp (which already focuses/restores an existing
 * single-instance window instead of duplicating it) and the shared app
 * registry, so no app list is duplicated here.
 */
export default function MobileDock() {
  const isAllAppsOpen = useMobileUIStore((s) => s.isAllAppsOpen);
  const toggleAllApps = useMobileUIStore((s) => s.toggleAllApps);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.15 }}
      className="os-dock pixel-cut fixed inset-x-0 bottom-0 z-9998 flex items-center justify-around border-t-[length:var(--os-border-width)] border-os-border-strong bg-os-surface/95 px-4 backdrop-blur-sm shadow-os-window"
      style={{
        height: 'calc(var(--os-dock-height) + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Application dock"
    >
      <MobilePrimaryButton appId={MOBILE_PRIMARY_LEFT_APP} />
      <MobileDockButton
        label="All Apps"
        isActive={isAllAppsOpen}
        onClick={toggleAllApps}
        aria-expanded={isAllAppsOpen}
      >
        <LayoutGrid size={24} strokeWidth={2.25} />
      </MobileDockButton>
      <MobilePrimaryButton appId={MOBILE_PRIMARY_RIGHT_APP} />
    </motion.div>
  );
}

function MobilePrimaryButton({ appId }) {
  const manifest = getApp(appId);
  const openApp = useWindowStore((s) => s.openApp);
  const windows = useWindowStore((s) => s.windows);
  const focusedId = useWindowStore((s) => s.focusedId);

  if (!manifest) return null;

  const isRunning = Object.values(windows).some((w) => w.appId === appId);
  const isActive = Object.values(windows).some((w) => w.id === focusedId && w.appId === appId);
  const Icon = DESKTOP_LOGOS[appId] ?? manifest.icon;

  return (
    <MobileDockButton
      label={manifest.title}
      isRunning={isRunning}
      isActive={isActive}
      onClick={() => openApp(appId)}
    >
      {Icon ? <Icon size={26} className="h-[26px] w-[26px]" /> : null}
    </MobileDockButton>
  );
}

function MobileDockButton({ label, isActive, isRunning, onClick, children, ...rest }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="relative flex min-w-[64px] flex-col items-center gap-1 py-1.5"
      aria-label={label}
      {...rest}
    >
      <span
        className={`pixel-cut os-icon-shell flex items-center justify-center border-[length:var(--os-border-width)] border-os-border-strong shadow-os-window transition-colors ${
          isActive ? 'bg-os-accent text-os-accent-ink' : 'bg-os-surface text-os-ink'
        }`}
      >
        {children}
      </span>
      <span className="max-w-[64px] truncate font-display text-[8px] tracking-[var(--os-display-tracking)] text-os-ink-soft">
        {label}
      </span>
      {isRunning ? (
        <span
          className={`absolute -top-0.5 right-[18px] h-1.5 w-1.5 rounded-full ${
            isActive ? 'bg-os-accent' : 'bg-os-ink-soft'
          }`}
        />
      ) : null}
    </motion.button>
  );
}
