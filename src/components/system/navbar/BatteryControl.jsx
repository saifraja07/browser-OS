import { AnimatePresence } from 'framer-motion';
import { BatteryFull, BatteryLow, BatteryMedium, BatteryWarning } from 'lucide-react';
import { useRef, useState } from 'react';
import { useSystemBarStore } from '../../../store/useSystemBarStore';
import { useCloseOnOutside } from '../../../hooks/useCloseOnOutside';
import SystemPanel from './SystemPanel';

// BrowserOS has no real device battery access, so this is a stable,
// plausible reading picked once per session rather than a fake live drain.
function pickSimulatedLevel() {
  return Math.floor(Math.random() * 46) + 35; // 35–80%
}

function levelIcon(level) {
  if (level <= 15) return BatteryWarning;
  if (level <= 40) return BatteryLow;
  if (level <= 75) return BatteryMedium;
  return BatteryFull;
}

export default function BatteryControl() {
  const [level] = useState(pickSimulatedLevel);
  const isOpen = useSystemBarStore((s) => s.activeMenu === 'battery');
  const toggleMenu = useSystemBarStore((s) => s.toggleMenu);
  const closeMenu = useSystemBarStore((s) => s.closeMenu);
  const ref = useRef(null);

  useCloseOnOutside(ref, isOpen, closeMenu);

  const Icon = levelIcon(level);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => toggleMenu('battery')}
        aria-label="Battery status"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="flex h-8 w-8 items-center justify-center rounded-[var(--os-radius-sm)] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-colors hover:bg-white/15 active:bg-white/20"
      >
        <Icon size={16} strokeWidth={2.25} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <SystemPanel
            title="Battery Status"
            onClose={closeMenu}
            className="absolute right-0 top-full z-[var(--z-navbar-menu)] mt-2 max-w-[calc(100vw-24px)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-os-ink-soft">Level</span>
              <span className="font-display text-[11px] text-os-ink">{level}%</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-[var(--os-radius-sm)] border-2 border-os-border bg-os-surface-2">
              <div className="h-full bg-os-ink" style={{ width: `${level}%` }} />
            </div>
            <p className="mt-3 text-os-ink-soft">Status: On Battery Power</p>
          </SystemPanel>
        )}
      </AnimatePresence>
    </div>
  );
}
