/**
 * Normalizes a raw address-bar string into a navigable http(s) URL, or
 * returns null if the input is empty/invalid. Never throws.
 *
 * - "example.com"        -> "https://example.com"
 * - "https://example.com" -> "https://example.com" (unchanged)
 * - ""/"   "              -> null
 * - anything unparsable   -> null
 */
export function normalizeUrl(rawInput) {
  if (typeof rawInput !== 'string') return null;

  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z\d+.-]*):\/\//);
  if (schemeMatch && !/^https?$/i.test(schemeMatch[1])) {
    return null;
  }

  const candidate = schemeMatch ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if (!parsed.hostname) return null;
    if (parsed.username || parsed.password) return null;
    return candidate;
  } catch {
    return null;
  }
}

/**
 * Decides whether the address-bar input should be treated as a URL to
 * navigate to, or a search query to send to searchInternet().
 *
 * Examples:
 *   "https://react.dev"        -> true  (URL)
 *   "developer.mozilla.org"    -> true  (URL)
 *   "react.dev"                -> true  (URL)
 *   "react tutorial"           -> false (search)
 *   "best javascript framework"-> false (search)
 *   "how to learn react"       -> false (search)
 */
export function isLikelyUrl(rawInput) {
  if (typeof rawInput !== 'string') return false;

  const trimmed = rawInput.trim();
  if (!trimmed) return false;
  if (/\s/.test(trimmed)) return false;

  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z\d+.-]*):\/\//);

  if (!schemeMatch) {
    const hostPart = trimmed.split(/[/?#]/)[0].split(':')[0];
    const looksLikeHost = hostPart === 'localhost' || hostPart.includes('.');
    if (!looksLikeHost) return false;
  }

  return normalizeUrl(trimmed) !== null;
}
