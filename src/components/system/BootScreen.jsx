import { useEffect, useRef } from 'react';
import { BrowserOSLogo } from './SystemLogos';

const BOOT_DURATION_MS = 2400;

/**
 * First-paint layer: a brief retro startup screen shown on every page load,
 * before the login/unlock screen. Purely cosmetic — nothing is actually
 * loading here, it just paces the BrowserOS "startup" beat.
 */
export default function BootScreen({ onFinish }) {
  // Ref so the boot timer (set up once) always calls the latest onFinish
  // without needing to be an effect dependency.
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    const timer = setTimeout(() => onFinishRef.current?.(), BOOT_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[var(--z-boot)] flex items-center justify-center bg-gradient-to-br from-os-bg to-os-bg-2 px-4">
      <div className="pixel-cut flex w-[260px] flex-col items-center gap-4 border-[3px] border-os-border-strong bg-os-surface px-6 py-7 shadow-os-window sm:w-[300px]">
        <BrowserOSLogo size={52} />
        <div className="text-center">
          <p className="font-display text-sm tracking-[var(--os-display-tracking)] text-os-ink">
            BrowserOS
          </p>
          <p className="mt-1.5 font-body text-[11px] text-os-ink-soft">Starting Up…</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-[var(--os-radius-sm)] border-2 border-os-border bg-os-surface-2">
          <div className="os-boot-bar h-full w-1/3 rounded-[var(--os-radius-sm)] bg-os-accent" />
        </div>
      </div>
    </div>
  );
}
