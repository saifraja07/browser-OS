import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';
import { useSystemBarStore } from '../../../store/useSystemBarStore';
import { useWindowStore } from '../../../store/useWindowStore';
import { notify } from '../../../store/useNotificationStore';
import { useCloseOnOutside } from '../../../hooks/useCloseOnOutside';
import computerIcon from '../../../assets/icons/computer.webp';

/**
 * The navbar's left side: just the BrowserOS favicon, opening the OS's
 * system menu underneath it — the closest thing this project has to a
 * dedicated "system menu," built fresh since none existed yet, but reusing
 * the same open/close pattern as every other navbar control.
 */
export default function BrowserOSMenu({ onShutDown }) {
  const isOpen = useSystemBarStore((s) => s.activeMenu === 'browseros');
  const toggleMenu = useSystemBarStore((s) => s.toggleMenu);
  const closeMenu = useSystemBarStore((s) => s.closeMenu);
  const openApp = useWindowStore((s) => s.openApp);
  const ref = useRef(null);

  useCloseOnOutside(ref, isOpen, closeMenu);

  const runAndClose = (action) => {
    action();
    closeMenu();
  };

  const items = [
    { id: 'about', label: 'About This OS', onSelect: () => openApp('about') },
    {
      id: 'system-info',
      label: 'System Info',
      onSelect: () =>
        notify({
          title: 'System Info',
          message: `${navigator.platform || 'Web'} · ${window.innerWidth}×${window.innerHeight} · ${
            Intl.DateTimeFormat().resolvedOptions().timeZone
          }`,
        }),
    },
    { id: 'settings', label: 'Settings', onSelect: () => openApp('settings') },
    {
      id: 'licenses',
      label: 'Licenses',
      onSelect: () =>
        notify({
          title: 'Licenses',
          message: 'BrowserOS is a personal project built with React, Vite, Zustand & Framer Motion.',
        }),
    },
    { id: 'explore', label: 'Explore', onSelect: () => openApp('explorer') },
  ];

  return (
  <div ref={ref} className="relative">
  <button
    type="button"
    onClick={() => toggleMenu('browseros')}
    aria-label="BrowserOS menu"
    aria-haspopup="menu"
    aria-expanded={isOpen}
    className="flex  h-5 w-5 sm:h-12 sm:w-12 sm:-ml-2 items-center justify-center rounded-[var(--os-radius-sm)] transition-colors  hover:bg-white/15 active:bg-white/20"
  >
    <img
      src={computerIcon}
      alt=""
      draggable="false"
      className="h-6 w-6 shrink-0 object-contain scale-[2] [image-rendering:pixelated]"
    />
  </button>

  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.12 }}
        role="menu"
        aria-label="BrowserOS menu"
        className="pixel-cut absolute left-0 top-full z-[var(--z-navbar-menu)] mt-2 w-48 overflow-hidden border-[length:var(--os-border-width)] border-os-border-strong bg-os-surface py-1 shadow-os-window"
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            onClick={() => runAndClose(item.onSelect)}
            className="flex w-full items-center px-3 py-1.5 text-left font-body text-[12.5px] text-os-ink transition-colors hover:bg-os-accent hover:text-os-accent-ink"
          >
            {item.label}
          </button>
        ))}

        <div className="my-1 border-t-2 border-os-border" />

        <button
          type="button"
          role="menuitem"
          onClick={() => runAndClose(onShutDown)}
          className="flex w-full items-center px-3 py-1.5 text-left font-body text-[12.5px] text-os-danger transition-colors hover:bg-os-danger hover:text-os-surface"
        >
          Shut Down
        </button>
      </motion.div>
    )}
  </AnimatePresence>
</div>
  );
}
