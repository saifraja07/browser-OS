import { Suspense, lazy, memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  useWindowStore,
  selectWindow,
  selectIsFocused,
} from "../../store/useWindowStore";
import { getApp } from "../../core/appRuntime/appRegistry";
import { useWindowDrag } from "../../hooks/useWindowDrag";
import { useIsMobile } from "../../hooks/useIsMobile";
import {
  Z_INDEX_BASE,
  Z_MAXIMIZED_BASE,
} from "../../core/windowManager/constants";
import { getViewportSize } from "../../core/windowManager/mobileLayout";
import TitleBar from "./TitleBar";
import ResizeHandles from "./ResizeHandles";

const openCloseVariants = {
  initial: { opacity: 0, scale: 0.92, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.94, y: 8 },
};

// How long a freshly-created window's title-bar controls ignore input after
// mount. Mobile-only: a right-edge desktop icon (Community's own default
// slot included — see windowManager.js's `createdAt` comment) can sit
// directly on top of where that same window's Minimize/Maximize/Close
// cluster renders, so the very tap that opened the window can immediately
// register on one of those buttons too, invisibly minimizing/maximizing/
// closing it depending on exactly where the tap landed. No real user can
// deliberately aim for a button that didn't exist a moment ago this fast —
// so it's safe to swallow input on brand-new controls for a beat.
const CONTROLS_GRACE_MS = 400;

function WindowFrame({ id }) {
  const win = useWindowStore(selectWindow(id));
  const isFocused = useWindowStore(selectIsFocused(id));
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const { onPointerDown, onPointerMove, onPointerUp } = useWindowDrag(id);
  const isMobile = useIsMobile();

  const manifest = useMemo(() => getApp(win?.appId), [win?.appId]);

  // Lazy-load the app body only once per manifest.
  const AppComponent = useMemo(() => {
    if (!manifest?.component) return null;
    return lazy(manifest.component);
  }, [manifest]);

  if (!win) return null;

  // A maximized window must cover the full viewport — including the navbar
  // (and dock) — edge to edge, with its own title bar visible at y: 0.
  const { width: viewportWidth, height: viewportHeight } = getViewportSize();
  const workspaceBounds = {
    x: 0,
    y: 0,
    width: viewportWidth,
    height: viewportHeight,
  };

  // Normal windows stack in the low z-index band below the navbar (see
  // constants.js). A maximized window is elevated into its own band above
  // the navbar and its popovers, while preserving the same relative
  // front-to-back order it had as a normal window.
  const zIndex = win.isMaximized
    ? Z_MAXIMIZED_BASE + (win.zIndex - Z_INDEX_BASE)
    : win.zIndex;

  // See CONTROLS_GRACE_MS above. Checked at call time (not render time) so
  // it reflects how long ago the window was *actually* created, not how
  // long ago this component happened to last re-render.
  const isControlsGraceActive = () =>
    isMobile && Date.now() - win.createdAt < CONTROLS_GRACE_MS;

  const handleMinimize = () => {
    if (isControlsGraceActive()) return;
    minimizeWindow(id);
  };
  const handleToggleMaximize = () => {
    if (isControlsGraceActive()) return;
    toggleMaximize(id, workspaceBounds);
  };
  const handleClose = () => {
    if (isControlsGraceActive()) return;
    closeWindow(id);
  };

  return (
    <motion.div
      role="dialog"
      aria-label={win.title}
      variants={openCloseVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      onPointerDown={() => focusWindow(id)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: "absolute",
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex,
        display: win.isMinimized ? "none" : undefined,
        boxShadow: isFocused
          ? "var(--shadow-os-window-focused)"
          : "var(--shadow-os-window)",
      }}
      className="relative flex flex-col overflow-hidden rounded-(--os-radius-window) border-(length:--os-border-width) border-os-border-strong bg-os-surface transition-[border-radius,border-width] duration-200"
    >
      <TitleBar
        title={win.title}
        appId={win.appId}
        isFocused={isFocused}
        isMaximized={win.isMaximized}
        onPointerDown={onPointerDown}
        onMinimize={handleMinimize}
        onToggleMaximize={handleToggleMaximize}
        onClose={handleClose}
      />

      <div className="min-h-0 flex-1 overflow-auto bg-os-surface">
        {AppComponent ? (
          <Suspense fallback={<AppLoadingFallback />}>
            <AppComponent {...(win.props ?? {})} windowId={id} />
          </Suspense>
        ) : (
          <div className="p-4 font-mono text-sm text-os-ink-soft">
            No component registered for "{win.appId}".
          </div>
        )}
      </div>

      {/* Corner/edge resize handles are a fiddly, imprecise touch target —
          resizing isn't part of the mobile spec, so keep it desktop-only. */}
      <ResizeHandles
        windowId={id}
        resizable={win.resizable && !win.isMaximized && !isMobile}
      />

      {/* Theme-driven texture overlay (scanlines/dither/etc). Purely decorative:
          non-interactive and defaults to `none`, so themes without a texture
          render nothing here. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "var(--os-window-texture)",
          backgroundSize: "var(--os-window-texture-size)",
        }}
      />
    </motion.div>
  );
}

function AppLoadingFallback() {
  return (
    <div className="flex h-full items-center justify-center font-mono text-xs text-os-ink-soft">
      loading…
    </div>
  );
}

// Memoized: a WindowFrame only re-renders when ITS OWN store slice changes,
// thanks to the selector-based subscriptions above — never on unrelated
// window changes.
export default memo(WindowFrame);
