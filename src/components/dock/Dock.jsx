import { motion } from 'framer-motion';
import { getAllApps } from '../../core/appRuntime/appRegistry';
import DockItem from './DockItem';

// README still has its own desktop shortcut, so it's left out of the dock
// to avoid a duplicate launch point. About no longer has a desktop
// shortcut (the shortcut bar is fixed to exactly 5 apps), so it now lives
// in the dock to stay reachable.
const DESKTOP_ONLY_APPS = new Set(['readme']);

export default function Dock() {
  const apps = getAllApps().filter((app) => !DESKTOP_ONLY_APPS.has(app.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.15 }}
      className="os-dock rounded-xl fixed bottom-4 left-1/2 z-(--z-navbar) flex -translate-x-1/2 items-end gap-[var(--os-dock-gap)] border-[length:var(--os-border-width)] border-os-border-strong bg-transparent px-4 py-2.5 backdrop-blur-sm shadow-os-window"
      aria-label="Application dock"
    >
      {apps.map((app) => (
        <DockItem key={app.id} app={app} />
      ))}
    </motion.div>
  );
}
