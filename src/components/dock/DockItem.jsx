import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useWindowStore } from '../../store/useWindowStore';
import { DESKTOP_LOGOS } from '../desktop/desktopLogos';

export default function DockItem({ app }) {
  const { windows, focusedId } = useWindowStore(
    useShallow((state) => ({
      windows: state.windows,
      focusedId: state.focusedId,
    }))
  );

  const openApp = useWindowStore((state) => state.openApp);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);

  const runningWindows = Object.values(windows).filter(
    (window) => window.appId === app.id
  );

  const isRunning = runningWindows.length > 0;
  const isActive = runningWindows.some(
    (window) => window.id === focusedId && !window.isMinimized
  );

  const handleClick = () => {
    if (!isRunning) {
      openApp(app.id);
      return;
    }

    const primary = runningWindows[0];
    if (primary.id === focusedId && !primary.isMinimized) {
      minimizeWindow(primary.id);
    } else {
      focusWindow(primary.id);
    }
  };

  const Icon = DESKTOP_LOGOS[app.id] ?? app.icon;

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{ y: -12, scale: 1.2 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 430, damping: 17 }}
      className="group relative flex flex-col items-center px-0.5 py-0.5 transition-[filter] duration-150 hover:brightness-110"
      aria-label={app.title}
    >
      <span
        className="flex h-13 w-13 items-center justify-center rounded-lg bg-os-surface/75 text-os-ink shadow-[0_2px_6px_rgba(43,36,56,0.18)] transition-[background-color,box-shadow] duration-150 group-hover:bg-os-surface/95 group-hover:shadow-[0_6px_8px_rgba(43,36,56,0.28)]"
      >
        {Icon ? <Icon size={34} className="h-8.5 w-8.5" /> : null}
      </span>

      <span
        className={`absolute -bottom-2 h-1.5 w-1.5 rounded-full transition-opacity ${
          isRunning ? 'opacity-100' : 'opacity-0'
        } bg-os-ink-soft`}
      />

      <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-lg bg-os-surface/95 px-2.5 py-1 font-display text-[9px] text-os-ink opacity-0 shadow-[0_4px_8px_rgba(43,36,56,0.28)] backdrop-blur-sm transition-all duration-150 group-hover:-translate-y-1 group-hover:opacity-100">
        {app.title}
      </span>
    </motion.button>
  );
}
