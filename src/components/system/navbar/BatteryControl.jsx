import { AnimatePresence } from 'framer-motion';
import { BatteryFull, BatteryLow, BatteryMedium, BatteryWarning } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSystemBarStore } from '../../../store/useSystemBarStore';
import { useCloseOnOutside } from '../../../hooks/useCloseOnOutside';
import SystemPanel from './SystemPanel';

function levelIcon(level) {
  if (level <= 15) return BatteryWarning;
  if (level <= 40) return BatteryLow;
  if (level <= 75) return BatteryMedium;
  return BatteryFull;
}

export default function BatteryControl() {
  const [battery, setBattery] = useState(null);
  const isOpen = useSystemBarStore((s) => s.activeMenu === 'battery');
  const toggleMenu = useSystemBarStore((s) => s.toggleMenu);
  const closeMenu = useSystemBarStore((s) => s.closeMenu);
  const ref = useRef(null);

  useCloseOnOutside(ref, isOpen, closeMenu);

  useEffect(() => {
    let mounted = true;
    let batteryManager;

    const updateBattery = () => {
      if (!mounted || !batteryManager) return;
      setBattery({
        level: Math.round(batteryManager.level * 100),
        charging: batteryManager.charging,
        chargingTime: batteryManager.chargingTime,
        dischargingTime: batteryManager.dischargingTime,
      });
    };

    const setupBattery = async () => {
      if (!('getBattery' in navigator)) return;
      try {
        batteryManager = await navigator.getBattery();
        if (!mounted) return;
        updateBattery();
        batteryManager.addEventListener('levelchange', updateBattery);
        batteryManager.addEventListener('chargingchange', updateBattery);
        batteryManager.addEventListener('chargingtimechange', updateBattery);
        batteryManager.addEventListener('dischargingtimechange', updateBattery);
      } catch {
        // Battery access can be unavailable in some browsers/contexts.
      }
    };

    setupBattery();

    return () => {
      mounted = false;
      if (!batteryManager) return;
      batteryManager.removeEventListener('levelchange', updateBattery);
      batteryManager.removeEventListener('chargingchange', updateBattery);
      batteryManager.removeEventListener('chargingtimechange', updateBattery);
      batteryManager.removeEventListener('dischargingtimechange', updateBattery);
    };
  }, []);

  const level = battery?.level ?? 0;
  const Icon = levelIcon(level);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => toggleMenu('battery')}
        aria-label={battery ? `Battery ${level}%` : 'Battery status'}
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
            {battery ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-os-ink-soft">Level</span>
                  <span className="font-display text-[11px] text-os-ink">{level}%</span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-[var(--os-radius-sm)] border-2 border-os-border bg-os-surface-2">
                  <div className="h-full bg-os-ink transition-[width] duration-300" style={{ width: `${level}%` }} />
                </div>
                <p className="mt-3 text-os-ink-soft">
                  Status: {battery.charging ? 'Charging' : 'On Battery Power'}
                </p>
              </>
            ) : (
              <p className="text-os-ink-soft">Battery information is not available in this browser.</p>
            )}
          </SystemPanel>
        )}
      </AnimatePresence>
    </div>
  );
}
