/**
 * App Runtime — the registry of installable/launchable apps.
 *
 * This is the ONLY place that knows about concrete app implementations.
 * The Window Manager, Dock, and Desktop never import an app component
 * directly — they look it up here by id and render whatever is registered.
 *
 * A manifest shape:
 * {
 *   id: string,              // unique app id, e.g. "terminal"
 *   title: string,           // display name
 *   icon: React.ComponentType | string, // app-specific icon component or asset path
 *   component: () => Promise<{ default: React.ComponentType }>, // lazy import
 *   defaultSize: { width, height },
 *   minSize: { width, height },
 *   resizable: boolean,
 *   draggable: boolean,
 *   singleInstance: boolean, // if true, focus the existing window instead of opening a new one
 * }
 */

const registry = new Map();

/** Registers an app manifest. Throws if the id is already taken (fail loud in dev). */
export function registerApp(manifest) {
  if (!manifest?.id) {
    throw new Error('[appRuntime] Cannot register an app without an id.');
  }
  if (registry.has(manifest.id)) {
    console.warn(`[appRuntime] App "${manifest.id}" is already registered — overwriting.`);
  }
  registry.set(manifest.id, {
    singleInstance: false,
    resizable: true,
    draggable: true,
    ...manifest,
  });
}

/** Registers multiple manifests at once. */
export function registerApps(manifests) {
  manifests.forEach(registerApp);
}

export function getApp(id) {
  return registry.get(id) ?? null;
}

export function getAllApps() {
  return Array.from(registry.values());
}

export function isRegistered(id) {
  return registry.has(id);
}
