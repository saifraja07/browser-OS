import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { useSystemBarStore } from "../../../store/useSystemBarStore";
import { useWindowStore } from "../../../store/useWindowStore";
import { useCloseOnOutside } from "../../../hooks/useCloseOnOutside";
import { clearSiteData } from "../../../core/storage/clearSiteData";
import SystemPanel from "./SystemPanel";
import computerIcon from "../../../assets/icons/computer.webp";

/**
 * BrowserOS system menu.
 * Keeps the compact retro BrowserOS look while allowing
 * a small amount of wallpaper to show through the menu.
 */
export default function BrowserOSMenu({ onShutDown }) {
  const activeMenu = useSystemBarStore((s) => s.activeMenu);

  const isOpen = activeMenu === "browseros";
  const isAboutOpen = activeMenu === "about";
  const isSystemInfoOpen = activeMenu === "system-info";
  const isLicensesOpen = activeMenu === "licenses";
  const isClearSiteDataOpen =
    activeMenu === "clear-site-data-confirm";
  const isShutDownOpen = activeMenu === "shutdown";

  const toggleMenu = useSystemBarStore((s) => s.toggleMenu);
  const closeMenu = useSystemBarStore((s) => s.closeMenu);

  const openApp = useWindowStore((s) => s.openApp);

  const ref = useRef(null);

  useCloseOnOutside(
    ref,
    activeMenu !== null &&
      (isOpen ||
        isAboutOpen ||
        isSystemInfoOpen ||
        isLicensesOpen ||
        isClearSiteDataOpen ||
        isShutDownOpen),
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

  const openShutDownConfirmation = () => {
    toggleMenu("shutdown");
  };

  const handleProceedShutdown = () => {
    closeMenu();
    onShutDown();
  };

  const items = [
    {
      id: "about",
      label: "About This OS",
      onSelect: () => openSystemPanel("about"),
    },
    {
      id: "system-info",
      label: "System Info",
      onSelect: () => openSystemPanel("system-info"),
    },
    {
      id: "settings",
      label: "Settings",
      onSelect: () => openApp("settings"),
    },
    {
      id: "licenses",
      label: "Licenses",
      onSelect: () => openSystemPanel("licenses"),
    },
  ];

  return (
    <div ref={ref} className="relative">
      {/* BrowserOS button */}
      <button
        type="button"
        onClick={() => toggleMenu("browseros")}
        aria-label="BrowserOS menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
       className="
  flex
  h-5 w-5
  sm:h-12 sm:w-12 sm:-ml-2
  items-center
  justify-center
  rounded-(--os-radius-sm)
  hover:bg-white/15
  active:bg-white/20
"
      >
        <img
          src={computerIcon}
          alt=""
          draggable="false"
          className="
            h-6 w-6
            shrink-0
            object-contain
            scale-[2]
            [image-rendering:pixelated]
          "
        />
      </button>

      <AnimatePresence>
        {/* Main BrowserOS menu */}
       {isOpen && (
  <motion.div
    initial={{
      opacity: 0,
      scale: 0.95,
      y: -4,
    }}
    animate={{
      opacity: 1,
      scale: 1,
      y: 0,
    }}
    exit={{
      opacity: 0,
      scale: 0.96,
    }}
    transition={{
      duration: 0.12,
    }}
    role="menu"
    aria-label="BrowserOS menu"
    className="
      pixel-cut
      absolute
      left-0
      top-full
      z-(--z-navbar-menu)
      mt-2
      w-48
      overflow-hidden
      border-(length:--os-border-width)
      border-os-border-strong
      bg-os-surface/80
      backdrop-blur-[2px]
      py-1
      shadow-os-window
    "
  >
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        role="menuitem"
        onClick={() => {
          if (
            item.id === "about" ||
            item.id === "system-info" ||
            item.id === "licenses"
          ) {
            item.onSelect();
          } else {
            runAndClose(item.onSelect);
          }
        }}
        className="
          flex
          w-full
          items-center
          px-3
          py-1.5
          text-left
          font-body
          text-[12px]
          tracking-normal
          text-os-ink
          hover:bg-os-accent
          hover:text-os-accent-ink
        "
      >
        {item.label}
      </button>
    ))}

    <div className="my-1 border-t-2 border-os-border/70" />

    <button
      type="button"
      role="menuitem"
      onClick={openShutDownConfirmation}
      className="
        flex
        w-full
        items-center
        px-3
        py-1.5
        text-left
        font-body
        text-[12px]
        tracking-normal
        text-os-ink
        hover:bg-os-ink
        hover:text-os-surface
      "
    >
      Shut Down
    </button>

    <button
      type="button"
      role="menuitem"
      onClick={openClearSiteDataConfirmation}
      className="
        flex
        w-full
        items-center
        px-3
        py-1.5
        text-left
        font-body
        text-[12px]
        tracking-normal
        text-os-danger
        hover:bg-os-danger
        hover:text-os-surface
      "
    >
      Erase Memory
    </button>
  </motion.div>
)}

        {/* About This OS */}
        {isAboutOpen && (
          <SystemPanel
            title="About This OS"
            onClose={closeMenu}
            className="
              absolute
              left-0
              top-full
              z-(--z-navbar-menu)
              mt-2
              max-w-[calc(100vw-24px)]
            "
          >
            <div className="max-h-[min(62vh,430px)] overflow-y-auto pr-1 text-[11px] leading-5 text-os-ink-soft">
              <div>
                <h2 className="font-display text-sm text-os-ink">
                  BrowserOS
                </h2>

                <p className="mt-0.5 text-[10px]">
                  Version 1.0
                </p>
              </div>

              <div className="my-3 border-y-2 border-os-border py-3">
                <p>Welcome to BrowserOS!</p>

                <p className="mt-2">
                  Your little desktop, right inside your browser.
                </p>

                <p className="mt-2">
                  Inspired by the classic computers of the 1990s — when
                  computers were beige, pixels were chunky, and every
                  click felt important.
                </p>
              </div>

              <div className="border-os-border">
                <p>
                  Running entirely in your web browser.
                </p>

                <p className="mt-1">
                  © 2026 BrowserOS
                </p>

                <p className="mt-1">
                  Created by Saif
                </p>
              </div>
            </div>
          </SystemPanel>
        )}

        {/* System Info */}
        {isSystemInfoOpen && (
          <SystemPanel
            title="System Info"
            onClose={closeMenu}
            className="
              absolute
              left-0
              top-full
              z-(--z-navbar-menu)
              mt-2
              max-w-[calc(100vw-24px)]
            "
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-os-ink-soft">
                Platform
              </span>

              <span className="text-right">
                {navigator.platform || "Web"}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-4">
              <span className="text-os-ink-soft">
                Viewport
              </span>

              <span>
                {window.innerWidth} × {window.innerHeight}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-4">
              <span className="text-os-ink-soft">
                Timezone
              </span>

              <span className="max-w-32 truncate text-right">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </span>
            </div>
          </SystemPanel>
        )}

        {/* Licenses */}
        {isLicensesOpen && (
          <SystemPanel
            title="Licenses"
            onClose={closeMenu}
            className="
              absolute
              left-0
              top-full
              z-(--z-navbar-menu)
              mt-2
              max-w-[calc(100vw-24px)]
            "
          >
            <p className="leading-5">
              © 2026 BrowserOS. It is a personal project created
              for learning, experimentation, and building a
              desktop-like experience on the web. All rights
              reserved.
            </p>
          </SystemPanel>
        )}

        {/* Shut Down */}
        {isShutDownOpen && (
          <SystemPanel
            title="Shut Down"
            onClose={closeMenu}
            className="
              absolute
              left-0
              top-full
              z-(--z-navbar-menu)
              mt-2
              max-w-[calc(100vw-24px)]
            "
          >
            <p className="leading-5">
              Shut down functionality is disabled in this demo.
            </p>

            <div className="mt-3 flex justify-start">
              <button
                type="button"
                onClick={handleProceedShutdown}
                className="
                  border-(length:--os-border-width)
                  border-os-border-strong
                  bg-os-surface
                  px-3
                  py-1.5
                  font-body
                  text-[11px]
                  text-os-ink
                  hover:bg-os-ink
                  hover:text-os-surface
                "
              >
                Proceed Anyway
              </button>
            </div>
          </SystemPanel>
        )}

        {/* Erase Memory */}
        {isClearSiteDataOpen && (
          <SystemPanel
            title="Erase Memory"
            onClose={closeMenu}
            className="
              absolute
              left-0
              top-full
              z-(--z-navbar-menu)
              mt-2
              max-w-[calc(100vw-24px)]
            "
          >
            <p className="leading-5">
              This will remove your BrowserOS files, settings,
              wallpapers, and other data stored by this site,
              then reload BrowserOS.
            </p>

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeMenu}
                className="
                  border-(length:--os-border-width)
                  border-os-border-strong
                  bg-os-surface
                  px-3
                  py-1.5
                  font-body
                  text-[11px]
                  text-os-ink
                  hover:bg-os-ink
                  hover:text-os-surface
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleClearSiteData}
                className="
                  border-(length:--os-border-width)
                  border-os-danger
                  bg-os-danger
                  px-3
                  py-1.5
                  font-body
                  text-[11px]
                  text-os-surface
                  hover:opacity-90
                "
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