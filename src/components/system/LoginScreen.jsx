import { useEffect, useRef, useState } from 'react';
import { useWallpaperStore, getActiveWallpaperSrc } from '../../store/useWallpaperStore';
import computerIcon from '../../assets/icons/computer.webp';

/**
 * Cosmetic-only BrowserOS unlock screen shown after boot.
 * There is no real authentication here — the input is never validated,
 * and any Enter press (including on an empty field) unlocks straight into the desktop.
 */
export default function LoginScreen({ onUnlock }) {
  const wallpaperSrc = useWallpaperStore(getActiveWallpaperSrc);
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleUnlock = (e) => {
    e.preventDefault();
    onUnlock();
  };

  return (
    <>
      {/* Blurred wallpaper */}
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-lg"
        style={{ backgroundImage: `url(${wallpaperSrc})` }}
        aria-hidden="true"
      />

      <form
        onSubmit={handleUnlock}
        className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 overflow-y-auto px-4 py-8 text-center"
      >
        {/* BrowserOS Computer Icon */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-os-border-strong bg-os-surface shadow-os-window sm:h-24 sm:w-24">
          <img
            src={computerIcon}
            alt="BrowserOS"
            className="h-full w-full object-cover"
          />
        </div>

        <p className="font-display text-sm tracking-(--os-display-tracking) text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] sm:text-base">
          Haadi
        </p>

        <div className="mt-1 flex w-full max-w-60 flex-col items-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
          <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
            <input
              ref={inputRef}
              type="password"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="It's open, Just press Enter."
              aria-label="Password (not required — press Enter to continue)"
              className="w-full rounded-3xl border-2 border-os-border bg-os-surface/95 px-3 py-2.5 text-[13px] text-os-ink outline-none placeholder:text-os-ink-soft focus:border-os-accent sm:w-52 sm:py-2"
            />

            <button
              type="submit"
              className="w-full shrink-0 rounded-3xl border-2 border-os-border-strong bg-os-accent px-4 py-2.5 font-display text-[12px] text-os-accent-ink hover:-translate-y-0.5 sm:w-auto sm:py-2"
            >
              Enter
            </button>
          </div>
        </div>
      </form>
    </>
  );
}