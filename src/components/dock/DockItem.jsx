import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useWindowStore } from '../../store/useWindowStore';


const handleClick = () => {
  console.log("CLICKED APP:", app.id);

  if (!isRunning) {
    console.log("Opening app:", app.id);
    const result = openApp(app.id);
    console.log("openApp returned:", result);
    return;
  }

  const primary = runningWindows[0];

  if (primary.id === focusedId && !primary.isMinimized) {
    console.log("Minimizing:", primary.id);
    minimizeWindow(primary.id);
  } else {
    console.log("Focusing:", primary.id);
    focusWindow(primary.id);
  }
};


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
    (window) =>
      window.id === focusedId && !window.isMinimized
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

  const Icon = app.icon;

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{ y: -8, scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{
        type: 'spring',
        stiffness: 420,
        damping: 18,
      }}
      className="group relative flex h-11 w-11 flex-col items-center"
      aria-label={app.title}
    >
      <span
        className={`pixel-cut flex h-11 w-11 items-center justify-center border-2 border-os-border-strong shadow-os-window ${
          isActive
            ? 'bg-os-accent text-os-accent-ink'
            : 'bg-os-surface text-os-ink'
        }`}
      >
        {Icon ? <Icon size={20} /> : null}
      </span>

      {/* Running indicator */}
      <span
        className={`absolute -bottom-2 h-1.5 w-1.5 rounded-full transition-opacity ${
          isRunning ? 'opacity-100' : 'opacity-0'
        } ${
          isActive
            ? 'bg-os-accent'
            : 'bg-os-ink-soft'
        }`}
      />

      {/* Tooltip */}
      <span className="pointer-events-none absolute -top-8 whitespace-nowrap rounded-md border-2 border-os-border-strong bg-os-surface px-2 py-0.5 font-display text-[9px] text-os-ink opacity-0 shadow-os-window transition-opacity group-hover:opacity-100">
        {app.title}
      </span>
    </motion.button>
  );
}