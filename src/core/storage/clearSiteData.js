import { closeStorageDatabase } from '../filesystem/storageDriver.js';
import { closeCustomWallpaperDatabase } from '../wallpaper/customWallpaperStorage.js';

/**
 * Clears BrowserOS data that the current origin is allowed to remove.
 *
 * Note: browsers intentionally prevent JavaScript from removing HttpOnly
 * cookies or data belonging to another origin. Everything accessible to this
 * page is cleared before the page is reloaded.
 */
export async function clearSiteData() {
  // Close BrowserOS-owned IndexedDB connections so deleteDatabase() is not
  // blocked by the running virtual filesystem or wallpaper store.
  try {
    await Promise.all([closeStorageDatabase(), closeCustomWallpaperDatabase()]);
  } catch {
    // Non-fatal. The browser may still be able to clear other storage types.
  }

  // Clear Web Storage first so persisted Zustand/settings data is removed.
  try {
    localStorage.clear();
  } catch {
    // Storage may be unavailable or restricted.
  }

  try {
    sessionStorage.clear();
  } catch {
    // Storage may be unavailable or restricted.
  }

  // Remove all IndexedDB databases created by this origin. This includes the
  // virtual filesystem and uploaded custom wallpaper storage.
  try {
    if (typeof indexedDB !== 'undefined') {
      if (typeof indexedDB.databases === 'function') {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases
            .map(({ name }) => name)
            .filter(Boolean)
            .map(
              (name) =>
                new Promise((resolve) => {
                  const request = indexedDB.deleteDatabase(name);
                  request.onsuccess = request.onerror = request.onblocked = () => resolve();
                }),
            ),
        );
      }
    }
  } catch {
    // Some browsers/private modes do not expose database enumeration.
  }

  // Clear the Origin Private File System when the browser exposes it.
  try {
    if (navigator.storage?.getDirectory) {
      const root = await navigator.storage.getDirectory();
      const entries = [];
      for await (const [name] of root.entries()) entries.push(name);
      await Promise.all(entries.map((name) => root.removeEntry(name, { recursive: true })));
    }
  } catch {
    // OPFS may be unavailable or restricted.
  }

  // Clear Cache Storage entries for this origin.
  try {
    if (typeof caches !== 'undefined') {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }
  } catch {
    // Cache Storage may be unavailable.
  }

  // Unregister service workers owned by this origin so a stale worker cannot
  // immediately repopulate cached data after the reset.
  try {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch {
    // Service workers may be unavailable.
  }

  // JavaScript cannot remove HttpOnly cookies, but it can remove cookies that
  // are accessible to document.cookie. Clear each cookie for the current path.
  try {
    if (typeof document !== 'undefined' && document.cookie) {
      const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
      const hostname = window.location.hostname;
      const hostParts = hostname.split('.');
      const domains = ['', hostname];

      // Also try parent domains where the current page is allowed to write.
      for (let i = 1; i < hostParts.length - 1; i += 1) {
        domains.push(`.${hostParts.slice(i).join('.')}`);
      }

      const paths = ['/'];
      const currentPath = window.location.pathname || '/';
      const segments = currentPath.split('/').filter(Boolean);
      let path = '';
      for (const segment of segments) {
        path += `/${segment}`;
        paths.push(path);
      }

      for (const cookie of cookies) {
        const name = cookie.split('=')[0];
        for (const cookiePath of paths) {
          for (const domain of domains) {
            const domainPart = domain ? `; domain=${domain}` : '';
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=${cookiePath}${domainPart}`;
          }
        }
      }
    }
  } catch {
    // Cookie access may be restricted.
  }
}
