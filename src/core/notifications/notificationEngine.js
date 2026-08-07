/**
 * Pure notification-queue engine, mirroring the windowManager pattern:
 * plain state in, new state out, no side effects. Timer scheduling
 * (setTimeout for auto-dismiss) is a side effect and deliberately lives
 * in the store, not here.
 *
 * State shape: { notifications: { [id]: Notification }, order: string[] }
 * `order` is tracked separately so display order is oldest-first-in,
 * newest-first-out without re-sorting by timestamp on every read.
 */

let idCounter = 0;
const generateId = () => `notif_${Date.now()}_${idCounter++}`;

export function createInitialState() {
  return { notifications: {}, order: [] };
}

/**
 * @param {object} input - { title, message, icon, appId, duration }
 *   duration: ms before auto-dismiss, or 0 for persistent (caller must dismiss).
 */
export function addNotification(state, input) {
  const id = generateId();
  const notification = {
    id,
    title: input.title ?? '',
    message: input.message ?? '',
    icon: input.icon ?? null,
    appId: input.appId ?? null,
    duration: input.duration ?? undefined, // resolved to a default by the store
    createdAt: Date.now(),
  };

  return {
    ...state,
    notifications: { ...state.notifications, [id]: notification },
    order: [...state.order, id],
  };
}

export function dismissNotification(state, id) {
  if (!state.notifications[id]) return state;
  const { [id]: removed, ...rest } = state.notifications;
  return {
    ...state,
    notifications: rest,
    order: state.order.filter((existingId) => existingId !== id),
  };
}

export function clearAll(state) {
  return createInitialState();
}
