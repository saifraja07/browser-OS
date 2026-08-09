import { AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { useSystemBarStore } from '../../../store/useSystemBarStore';
import { useCloseOnOutside } from '../../../hooks/useCloseOnOutside';
import { useClock } from '../../../hooks/useClock';
import SystemPanel from './SystemPanel';

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(date) {
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function ClockControl() {
  const now = useClock();
  const isOpen = useSystemBarStore((s) => s.activeMenu === 'time');
  const toggleMenu = useSystemBarStore((s) => s.toggleMenu);
  const closeMenu = useSystemBarStore((s) => s.closeMenu);
  const ref = useRef(null);

  useCloseOnOutside(ref, isOpen, closeMenu);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => toggleMenu('time')}
        aria-label="Date and time"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="rounded-[var(--os-radius-sm)] px-1.5 py-1 font-body text-[12px] tabular-nums text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-colors hover:bg-white/15 active:bg-white/20"
      >
        {formatTime(now)}
      </button>

      <AnimatePresence>
        {isOpen && (
          <SystemPanel
            title="Date & Time"
            onClose={closeMenu}
            className="absolute right-0 top-full z-[var(--z-navbar-menu)] mt-2 max-w-[calc(100vw-24px)]"
          >
            <p className="text-center font-display text-xl text-os-ink">{formatTime(now)}</p>
            <p className="mt-1.5 text-center text-[12px] text-os-ink">{formatDate(now)}</p>
            <p className="mt-2 text-center text-[11px] text-os-ink-soft">{timeZone}</p>
          </SystemPanel>
        )}
      </AnimatePresence>
    </div>
  );
}
