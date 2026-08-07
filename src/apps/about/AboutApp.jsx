export default function AboutApp() {
  return (
    <div className="flex h-full flex-col gap-3 p-5 font-body text-sm text-os-ink">
      <h2 className="font-display text-base text-os-ink">BrowserOS</h2>
      <p className="text-os-ink-soft">
        This window is rendered by the Window Manager core engine — dragging,
        resizing, focus, minimize, and maximize are all handled without this
        app knowing anything about window state.
      </p>
      <p className="text-os-ink-soft">Try opening a few windows and stacking them.</p>
    </div>
  );
}
