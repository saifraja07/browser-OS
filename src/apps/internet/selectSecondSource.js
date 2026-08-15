/**
 * Picks the "second source" shown alongside Wikipedia in the answer-first
 * search layout, from the results the existing search already returned —
 * no new fetch, no new ranking system.
 *
 * Deliberately simple and query-agnostic: skip anything on Wikipedia
 * itself (that's source #1), then prefer the first remaining result whose
 * domain looks like an authoritative reference/documentation source over
 * a "random website", falling back to the plain top remaining result when
 * nothing matches. Never invents a source — returns null when there's
 * nothing left to show.
 */

const WIKIPEDIA_DOMAIN_RE = /(^|\.)wikipedia\.org$/i;

// Not an exhaustive list — just enough well-known reference/docs domain
// patterns to break ties in favor of authoritative sources when one is
// available among the results. No per-topic special casing.
const AUTHORITATIVE_DOMAIN_HINTS = [
  'developer.mozilla.org',
  'docs.',
  '.gov',
  '.edu',
  'britannica.com',
  'nature.com',
  'w3.org',
  'ietf.org',
  'nodejs.org',
  'react.dev',
  'reactjs.org',
  'python.org',
  'iso.org',
  'who.int',
];

function isWikipediaDomain(domain) {
  return Boolean(domain) && WIKIPEDIA_DOMAIN_RE.test(domain);
}

function looksAuthoritative(domain) {
  if (!domain) return false;
  const d = domain.toLowerCase();
  return AUTHORITATIVE_DOMAIN_HINTS.some((hint) => d.includes(hint));
}

/**
 * @param {Array<{title?: string, url?: string, domain?: string, snippet?: string}>} results
 * @returns {{title?: string, url: string, domain?: string, snippet?: string} | null}
 */
export function selectSecondSource(results) {
  if (!Array.isArray(results) || results.length === 0) return null;

  const candidates = results.filter((r) => r?.url && !isWikipediaDomain(r.domain));
  if (candidates.length === 0) return null;

  return candidates.find((r) => looksAuthoritative(r.domain)) || candidates[0];
}
