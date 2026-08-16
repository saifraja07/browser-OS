import { useWallpaperStore, getActiveWallpaperSrc } from '../../store/useWallpaperStore';

/**
 * Persistent wallpaper layer, mounted once at the App root and kept alive
 * across every system stage (boot -> login -> desktop).
 *
 * Previously each stage rendered its own independent wallpaper: Desktop set
 * a CSS `background-image`, and LoginScreen rendered a second, separate
 * blurred `background-image` div. Every stage transition therefore tore
 * down one wallpaper element and mounted a brand new one, forcing the
 * browser to re-fetch/re-decode the image — which is what produced the
 * brief white flash between Login and Desktop. Mounting a single <img>
 * here means the wallpaper is decoded once; stage transitions only ever
 * toggle CSS (blur/scale) on this same element, never remount the image.
 *
 * The `bg-os-bg` fallback below is the exact class Desktop always used, so
 * if the image hasn't finished loading/decoding yet, the same fallback
 * background is visible instead of a blank/white gap.
 *
 * Blur is applied by default (Boot *and* Login) and only lifted once we
 * reach Desktop, rather than being toggled on specifically for Login.
 * Blurring a large image is expensive to rasterize the first time the
 * browser does it — toggling blur on right as Login appears meant that
 * first-time cost was paid in full view, showing a sharp wallpaper for a
 * moment before the blur "caught up". Since Boot already runs for a couple
 * of seconds on top of this layer (fully opaque, so none of this is
 * visible), applying the blur from the very first mount lets the browser
 * finish that work during Boot, so Login shows up already blurred with no
 * flash. `will-change` gives the browser an extra hint to promote the
 * layer early rather than waiting for the filter to actually change.
 */
export default function WallpaperLayer({ stage }) {
  const wallpaperSrc = useWallpaperStore(getActiveWallpaperSrc);
  const isDesktop = stage === 'desktop';

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-os-bg" aria-hidden="true">
      <img
        src={wallpaperSrc}
        alt=""
        draggable={false}
        style={{ willChange: 'filter, transform' }}
        className={`pointer-events-none h-full w-full select-none object-cover object-center ${
          isDesktop ? 'scale-100 blur-none' : 'scale-110 blur-lg'
        }`}
      />
    </div>
  );
}
