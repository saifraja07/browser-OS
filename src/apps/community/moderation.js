/**
 * Lightweight, maintainable moderation helpers shared by the client
 * (immediate UX feedback only) and mirrored server-side in the
 * `submit-post` Edge Function (supabase/functions/submit-post), which is
 * the layer that actually decides whether a post is allowed.
 *
 * IMPORTANT: this client-side check is a convenience, not a security
 * boundary. A user can bypass any frontend JS, so the Edge Function
 * re-normalizes and re-checks every submission before it ever reaches the
 * database. Never trust this module's result for anything but UX.
 *
 * The blocked-word list intentionally does not live here in a form the
 * client ships verbatim to the browser bundle in the clear for the *real*
 * decision — see the Edge Function's own copy, which is the source of
 * truth. This local list only needs to catch the obvious cases so honest
 * users get instant feedback instead of a round trip.
 */

const BASIC_BLOCKLIST = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'piss',
  'slut', 'whore', 'nigger', 'nigga', 'faggot', 'retard', 'rape',
];

/** Normalizes text so basic spacing/punctuation/casing tricks don't slip past a naive check. */
export function normalizeForModeration(text) {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ') // collapse punctuation/symbols used to break up words
    .replace(/\s+/g, ' ')
    .trim();
}

/** Client-side pre-check only — fast feedback, not authoritative. */
export function looksInappropriate(text) {
  const normalized = normalizeForModeration(text);
  const collapsed = normalized.replace(/\s+/g, '');
  return BASIC_BLOCKLIST.some(
    (word) => normalized.includes(word) || collapsed.includes(word)
  );
}

export const MODERATION_REJECTION_MESSAGE =
  "This message contains language that isn't allowed. Please revise it and try again.";
