import BrowserOSMenu from './navbar/BrowserOSMenu';
import WifiControl from './navbar/WifiControl';
import BatteryControl from './navbar/BatteryControl';
import ClockControl from './navbar/ClockControl';

/**
 * Old-school OS menu bar, anchored to the top of the viewport above the
 * desktop. Sits directly over the wallpaper (a subtle top-down scrim keeps
 * it legible on any wallpaper) rather than as an opaque panel like the
 * dock, matching the reference screenshots.
 */
export default function Navbar({ onShutDown }) {
  return (
    <div
      role="banner"
      className="fixed bg-white/40 inset-x-0 top-0 z-[var(--z-navbar)] flex h-[var(--os-titlebar-height)] items-center justify-between px-2 sm:px-3"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 to-transparent"
      />
      <BrowserOSMenu onShutDown={onShutDown} />
      <div className="flex items-center gap-1 sm:gap-1.5">
        <WifiControl />
        <BatteryControl />
        <ClockControl />
      </div>
    </div>
  );
}
