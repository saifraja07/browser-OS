import { AnimatePresence } from 'framer-motion';
import { Wifi } from 'lucide-react';
import { useRef } from 'react';
import { useSystemBarStore } from '../../../store/useSystemBarStore';
import { useCloseOnOutside } from '../../../hooks/useCloseOnOutside';
import SystemPanel from './SystemPanel';

/**
 * Simulated Wi-Fi status — BrowserOS never touches real device networking
 * APIs, this is purely decorative system-bar UI.
 */
export default function WifiControl() {
  const isOpen = useSystemBarStore((s) => s.activeMenu === 'wifi');
  const toggleMenu = useSystemBarStore((s) => s.toggleMenu);
  const closeMenu = useSystemBarStore((s) => s.closeMenu);
  const ref = useRef(null);

  useCloseOnOutside(ref, isOpen, closeMenu);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => toggleMenu('wifi')}
        aria-label="Wi-Fi status"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="flex h-8 w-8 items-center justify-center rounded-[var(--os-radius-sm)] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-colors hover:bg-white/15 active:bg-white/20"
      >
        <Wifi size={16} strokeWidth={2.25} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <SystemPanel
            title="Wi-Fi"
            onClose={closeMenu}
            className="absolute right-0 top-full z-[var(--z-navbar-menu)] mt-2 max-w-[calc(100vw-24px)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-os-ink-soft">Status</span>
              <span className="font-display text-[11px] text-os-mint">Connected</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-os-ink-soft">Network</span>
              <span>BrowserOS Wireless</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-os-ink-soft">Signal</span>
              <span>Excellent</span>
            </div>
          </SystemPanel>
        )}
      </AnimatePresence>
    </div>
  );
}
