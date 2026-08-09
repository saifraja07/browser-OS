import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { useSystemBarStore } from "../../../store/useSystemBarStore";
import { useWindowStore } from "../../../store/useWindowStore";
import { useCloseOnOutside } from "../../../hooks/useCloseOnOutside";
import { clearSiteData } from "../../../core/storage/clearSiteData";
import SystemPanel from "./SystemPanel";
import computerIcon from "../../../assets/icons/computer.webp";

/**
 * BrowserOS system menu. System Info and Licenses use the same compact
 * SystemPanel shell as Wi-Fi, Battery, and Date & Time, positioned directly
 * below the navbar.
 */
export default function BrowserOSMenu({ onShutDown }) {
  const activeMenu = useSystemBarStore((s) => s.activeMenu);
  const isOpen = activeMenu === "browseros";
  const isSystemInfoOpen = activeMenu === "system-info";
  const isLicensesOpen = activeMenu === "licenses";
  const isClearSiteDataOpen = activeMenu === "clear-site-data-confirm";
  const toggleMenu = useSystemBarStore((s) => s.toggleMenu);
  const closeMenu = useSystemBarStore((s) => s.closeMenu);
  const openApp = useWindowStore((s) => s.openApp);
  const ref = useRef(null);

  useCloseOnOutside(
    ref,
    activeMenu !== null &&
      (isOpen || isSystemInfoOpen || isLicensesOpen || isClearSiteDataOpen),
    closeMenu,
  );

  const runAndClose = (action) => {
    action();
    closeMenu();
  };

  const openSystemPanel = (id) => {
    toggleMenu(id);
  };

  const openClearSiteDataConfirmation = () => {
    toggleMenu("clear-site-data-confirm");
  };

  const handleClearSiteData = async () => {
    await clearSiteData();
    window.location.reload();
  };

  const items = [
    { id: "about", label: "About This OS", onSelect: () => openApp("about") },
    {
      id: "system-info",
      label: "System Info",
      onSelect: () => openSystemPanel("system-info"),
    },
    { id: "settings", label: "Settings", onSelect: () => openApp("settings") },
    {
      id: "licenses",
      label: "Licenses",
      onSelect: () => openSystemPanel("licenses"),
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => toggleMenu("browseros")}
        aria-label="BrowserOS menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex h-5 w-5 sm:h-12 sm:w-12 sm:-ml-2 items-center justify-center rounded-(--os-radius-sm)  hover:bg-white/15 active:bg-white/20"
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
            className="pixel-cut absolute left-0 top-full z-(--z-navbar-menu) mt-2 w-48 overflow-hidden border-[length:var(--os-border-width)] border-os-border-strong bg-os-surface py-1 shadow-os-window"
          >
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  if (item.id === "system-info" || item.id === "licenses") {
                    item.onSelect();
                  } else {
                    runAndClose(item.onSelect);
                  }
                }}
                className="flex w-full items-center px-3 py-1.5 text-left font-body text-[12.5px] text-os-ink  hover:bg-os-accent hover:text-os-accent-ink"
              >
                {item.label}
              </button>
            ))}

            <div className="my-1 border-t-2 border-os-border" />

            <button
              type="button"
              role="menuitem"
              onClick={() => runAndClose(onShutDown)}
              className="flex w-full items-center px-3 py-1.5 text-left font-body text-[12.5px]   hover:bg-os-danger hover:text-os-surface"
            >
              Shut Down
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={openClearSiteDataConfirmation}
              className="flex w-full items-center px-3 py-1.5 text-left font-body text-[12.5px] text-os-danger  hover:bg-os-accent hover:text-os-accent-ink"
            >
              Erase Memory
            </button>
          </motion.div>
        )}

        {isSystemInfoOpen && (
          <SystemPanel
            title="System Info"
            onClose={closeMenu}
            className="absolute left-0 top-full z-[var(--z-navbar-menu)] mt-2 max-w-[calc(100vw-24px)]"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-os-ink-soft">Platform</span>
              <span className="text-right">{navigator.platform || "Web"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <span className="text-os-ink-soft">Viewport</span>
              <span>
                {window.innerWidth} × {window.innerHeight}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <span className="text-os-ink-soft">Timezone</span>
              <span className="max-w-32 truncate text-right">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </span>
            </div>
          </SystemPanel>
        )}

        {isLicensesOpen && (
          <SystemPanel
            title="Licenses"
            onClose={closeMenu}
            className="absolute left-0 top-full z-[var(--z-navbar-menu)] mt-2 max-w-[calc(100vw-24px)]"
          >
            <p className="leading-5">
              © 2026 Haadi. BrowserOS is a personal project created for
              learning, experimentation, and building a desktop-like experience
              on the web. All rights reserved.
            </p>
          </SystemPanel>
        )}

        {isClearSiteDataOpen && (
          <SystemPanel
            title="Erase Memory"
            onClose={closeMenu}
            className="absolute left-0 top-full z-(--z-navbar-menu) mt-2 max-w-[calc(100vw-24px)]"
          >
            <p className="leading-5">
              This will remove your BrowserOS files, settings, wallpapers, and
              other data stored by this site, then reload BrowserOS.
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeMenu}
                className="border-[length:var(--os-border-width)] border-os-border-strong bg-os-surface px-3 py-1.5 font-body text-[11px] text-os-ink  hover:bg-os-ink hover:text-os-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearSiteData}
                className="border-[length:var(--os-border-width)] border-os-danger bg-os-danger px-3 py-1.5 font-body text-[11px] text-os-surface  hover:opacity-90"
              >
                Confirm
              </button>
            </div>
          </SystemPanel>
        )}
      </AnimatePresence>
    </div>
  );
}
