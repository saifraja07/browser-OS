import { motion } from 'framer-motion';
import { getAllApps } from '../../core/appRuntime/appRegistry';
import DockItem from './DockItem';

// README keeps its own desktop shortcut, so it is left out of the dock
// to avoid a duplicate launch point.
const DESKTOP_ONLY_APPS = new Set(['readme']);

export default function Dock() {
  const apps = getAllApps().filter((app) => !DESKTOP_ONLY_APPS.has(app.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.15 }}
      className="os-dock fixed bottom-4 left-1/2 z-(--z-navbar) flex -translate-x-1/2 items-end gap-(--os-dock-gap) rounded-[14px] bg-os-surface/35 px-3 py-2.5 shadow-[0_10px_30px_rgba(43,36,56,0.28),inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-xl"
      aria-label="Application dock"
    >
      {apps.map((app) => (
        <DockItem key={app.id} app={app} />
      ))}
    </motion.div>
  );
}
