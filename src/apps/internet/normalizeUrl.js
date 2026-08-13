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

  // Only treat a leading "scheme://" as an explicit protocol (this
  // deliberately excludes things like "example.com:8080", which has a
  // colon but no "//" and should still be read as a bare host[:port]).
  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z\d+.-]*):\/\//);
  if (schemeMatch && !/^https?$/i.test(schemeMatch[1])) {
    // An explicit non-http(s) scheme (ftp://, mailto:, javascript:, etc) —
    // this is a small http(s)-only browser, so decline rather than guess.
    return null;
  }

  const candidate = schemeMatch ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if (!parsed.hostname) return null;
    return candidate;
  } catch {
    return null;
  }
}
