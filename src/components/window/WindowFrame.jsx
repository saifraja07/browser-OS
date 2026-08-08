import { Suspense, lazy, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWindowStore, selectWindow, selectIsFocused } from '../../store/useWindowStore';
import { getApp } from '../../core/appRuntime/appRegistry';
import { useWindowDrag } from '../../hooks/useWindowDrag';
import TitleBar from './TitleBar';
import ResizeHandles from './ResizeHandles';

const openCloseVariants = {
  initial: { opacity: 0, scale: 0.92, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.94, y: 8 },
};

function WindowFrame({ id }) {
  const win = useWindowStore(selectWindow(id));
  const isFocused = useWindowStore(selectIsFocused(id));
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const { onPointerDown, onPointerMove, onPointerUp } = useWindowDrag(id);

  const manifest = useMemo(() => getApp(win?.appId), [win?.appId]);

  // Lazy-load the app body only once per manifest.
  const AppComponent = useMemo(() => {
    if (!manifest?.component) return null;
    return lazy(manifest.component);
  }, [manifest]);

  if (!win) return null;

  const workspaceBounds = { x: 8, y: 8, width: window.innerWidth - 16, height: window.innerHeight - 96 };

  return (
    <motion.div
      role="dialog"
      aria-label={win.title}
      variants={openCloseVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      onPointerDown={() => focusWindow(id)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: 'absolute',
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
        display: win.isMinimized ? 'none' : undefined,
        boxShadow: isFocused ? 'var(--shadow-os-window-focused)' : 'var(--shadow-os-window)',
      }}
      className="relative flex flex-col overflow-hidden rounded-[var(--os-radius-window)] border-[length:var(--os-border-width)] border-os-border-strong bg-os-surface transition-[border-radius,border-width] duration-200"
    >
      <TitleBar
        title={win.title}
        appId={win.appId}
        isFocused={isFocused}
        isMaximized={win.isMaximized}
        onPointerDown={onPointerDown}
        onMinimize={() => minimizeWindow(id)}
        onToggleMaximize={() => toggleMaximize(id, workspaceBounds)}
        onClose={() => closeWindow(id)}
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

      <ResizeHandles windowId={id} resizable={win.resizable && !win.isMaximized} />

      {/* Theme-driven texture overlay (scanlines/dither/etc). Purely decorative:
          non-interactive and defaults to `none`, so themes without a texture
          render nothing here. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'var(--os-window-texture)', backgroundSize: 'var(--os-window-texture-size)' }}
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
