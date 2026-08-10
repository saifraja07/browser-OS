import { supabase } from '../../lib/supabase';

const TABLE = 'guestbook';

/**
 * All Supabase/database access for the Community app lives here, kept out
 * of presentation components. Two kinds of errors are distinguished:
 *   - a config error (Supabase isn't set up) — surfaced as a distinct
 *     `code` so the UI can show a dev-friendly message instead of a scary
 *     generic one.
 *   - everything else (network/database) — surfaced as a generic,
 *     user-safe message. Technical details are only logged to the
 *     console, never shown to the visitor.
 */

function assertConfigured() {
  if (!supabase) {
    const error = new Error(
      'Community isn\u2019t configured yet \u2014 missing Supabase environment variables.'
    );
    error.code = 'NOT_CONFIGURED';
    throw error;
  }
}

/** Fetches all guestbook posts, newest first. */
export async function fetchPosts() {
  assertConfigured();

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, name, message, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[guestbookService] fetchPosts failed:', error);
    const friendly = new Error("Couldn't load messages. Please try again.");
    friendly.code = 'FETCH_FAILED';
    throw friendly;
  }

  return data ?? [];
}

/**
 * Submits a new post through the trusted `submit-post` Edge Function,
 * which re-validates, normalizes, and moderates the content server-side
 * before inserting it \u2014 the client can never skip that step by calling
 * the table directly. See supabase/functions/submit-post.
 */
export async function createPost({ name, message }) {
  assertConfigured();

  const { data, error } = await supabase.functions.invoke('submit-post', {
    body: { name, message },
  });

  if (error) {
    console.error('[guestbookService] createPost failed:', error);

    // Edge Function non-2xx responses land here; try to recover the
    // structured reason (validation/moderation/rate-limit) it returned.
    const context = error.context;
    let payload = null;
    try {
      payload = context && typeof context.json === 'function' ? await context.json() : null;
    } catch {
      payload = null;
    }

    const friendly = new Error(payload?.message || "Couldn't post your message. Please try again.");
    friendly.code = payload?.code || 'SUBMIT_FAILED';
    throw friendly;
  }

  if (!data?.post) {
    const friendly = new Error("Couldn't post your message. Please try again.");
    friendly.code = 'SUBMIT_FAILED';
    throw friendly;
  }

  return data.post;
}
