import { openDB } from 'idb';

/**
 * Storage for the one user-uploaded custom wallpaper.
 *
 * Built-in wallpapers are bundled assets (imported URLs, effectively free
 * to keep in memory). An uploaded photo is different — it can be several
 * megabytes, which is too large to comfortably keep in localStorage or in
 * React state. IndexedDB (via the `idb` package BrowserOS's VirtualFS
 * already depends on) is the appropriate place for it, mirroring the same
 * storageDriver pattern used for the filesystem.
 */

const DB_NAME = 'browseros-wallpaper';
const DB_VERSION = 1;
const STORE = 'custom-wallpaper';
const RECORD_KEY = 'active';

/** Reasonable standard raster image formats for a desktop wallpaper. */
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Generous but bounded, so one oversized upload can't blow out IndexedDB quota. */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB

let dbPromise = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(STORE);
      },
    });
  }
  return dbPromise;
}

/** Throws a descriptive, user-facing Error if the file isn't a usable wallpaper image. */
export function validateWallpaperFile(file) {
  if (!file) {
    throw new Error('No file selected.');
  }
  const looksLikeImage = ACCEPTED_TYPES.includes(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
  if (!looksLikeImage) {
    throw new Error('Please choose a JPG, PNG, or WEBP image.');
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Image is too large (max ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB).`);
  }
  return true;
}

/** Validates + persists the file as the (single) active custom wallpaper. */
export async function saveCustomWallpaper(file) {
  validateWallpaperFile(file);
  const db = await getDb();
  await db.put(STORE, { blob: file, type: file.type, name: file.name }, RECORD_KEY);
}

/** Returns { blob, type, name } or null if nothing is stored / storage is unavailable. */
export async function loadCustomWallpaper() {
  try {
    const db = await getDb();
    const record = await db.get(STORE, RECORD_KEY);
    return record?.blob ? record : null;
  } catch {
    // IndexedDB unavailable (private browsing, disabled storage, corrupted DB, etc.)
    // — treat as "no custom wallpaper" rather than breaking the app.
    return null;
  }
}

export async function clearCustomWallpaper() {
  try {
    const db = await getDb();
    await db.delete(STORE, RECORD_KEY);
  } catch {
    // Non-fatal — worst case the old blob just lingers in IndexedDB unused.
  }
}

export async function closeCustomWallpaperDatabase() {
  if (dbPromise) {
    try {
      const db = await dbPromise;
      db.close();
    } catch {
      // Database may already be unavailable or closed.
    } finally {
      dbPromise = null;
    }
  }
}
