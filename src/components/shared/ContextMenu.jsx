import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useContextMenuStore } from '../../store/useContextMenuStore';

export default function ContextMenu() {
  const { isOpen, x, y, items, close } = useContextMenuStore();
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) close();
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };

    // Skip the pointerdown that opened the menu.
    const raf = requestAnimationFrame(() => {
      window.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('keydown', handleKeyDown);
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  // Keep the menu on-screen near viewport edges.
  const clampedX = Math.min(x, window.innerWidth - 200);
  const clampedY = Math.min(y, window.innerHeight - items.length * 32 - 16);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          role="menu"
          initial={{ opacity: 0, scale: 0.9, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.12 }}
          style={{ left: clampedX, top: clampedY }}
          className="fixed z-[var(--z-context-menu)] min-w-[190px] overflow-hidden rounded-lg border-2 border-os-border-strong bg-os-surface py-1 shadow-os-window"
        >
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return;
                item.onSelect?.();
                close();
              }}
              className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left font-body text-[13px] text-os-ink transition-colors enabled:hover:bg-os-accent enabled:hover:text-os-accent-ink disabled:cursor-not-allowed disabled:text-os-ink-soft/50"
            >
              <span className="flex items-center gap-2">
                {item.icon ? <item.icon size={14} /> : null}
                {item.label}
              </span>
              {item.hint && <span className="text-[10px] text-os-ink-soft/70">{item.hint}</span>}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
