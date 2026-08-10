import { createClient } from '@supabase/supabase-js';

/**
 * Central Supabase client for BrowserOS.
 *
 * Only the PUBLIC anon key is ever read here — it is safe to ship to the
 * browser because every table it touches is protected by Row Level
 * Security (see supabase/migrations for the guestbook policies). The
 * service-role/secret key must never be referenced from frontend code; it
 * only ever lives in the Supabase Edge Function's server-side environment.
 *
 * Configure via `.env.local` (see `.env.example`):
 *   VITE_SUPABASE_URL=...
 *   VITE_SUPABASE_ANON_KEY=...
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // Development-only heads up — apps that need Supabase (currently just
  // Community) surface their own friendly config-error UI instead of
  // crashing the rest of BrowserOS.
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
      'Copy .env.example to .env.local and fill in your Supabase project details.'
  );
}

// `supabase` is null when unconfigured rather than throwing, so importing
// this module is always safe even before setup is complete.
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
