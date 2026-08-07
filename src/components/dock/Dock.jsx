import { motion } from 'framer-motion';
import { getAllApps } from '../../core/appRuntime/appRegistry';
import DockItem from './DockItem';

export default function Dock() {
  const apps = getAllApps();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.15 }}
      className="pixel-cut fixed bottom-4 left-1/2 z-[9998] flex -translate-x-1/2 items-end gap-3 border-2 border-os-border-strong bg-os-surface/90 px-4 py-3 backdrop-blur-sm"
    >
      {apps.map((app) => (
        <DockItem key={app.id} app={app} />
      ))}
    </motion.div>
  );
}
