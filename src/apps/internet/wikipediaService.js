/**
 * Dedicated service for the Internet app's Wikipedia-backed answer.
 * Talks to the public Wikimedia Action API directly (no API key
 * required) and normalizes everything into one small shape so nothing
 * downstream — the hook, the cache, the UI — ever has to know what a
 * raw Wikimedia response looks like.
 *
 * Two calls against en.wikipedia.org/w/api.php are used, both via the
 * MediaWiki Action API:
 *   1. `action=query&list=search` — finds the best-matching article
 *      title for the query.
 *   2. `action=query&prop=extracts&exintro&explaintext` — fetches the
 *      article's lead section (everything before the first heading) as
 *      plain text for that title. This is deliberately the *lead
 *      section*, not the short one-line search excerpt: it's real
 *      introductory content. Only the first paragraph (or first two, if
 *      the first alone is too short) is kept for display, so the answer
 *      stays a short, skimmable excerpt rather than a wall of text.
 */

const SEARCH_ENDPOINT = 'https://en.wikipedia.org/w/api.php';

const NOT_FOUND = { found: false };

// The answer should read like a short, skimmable excerpt, not a dumped
// article: normally just the first paragraph of the lead section. If
// that first paragraph is too short to actually explain anything, the
// second paragraph is added too — but never more than two.
const MIN_WORDS_FOR_SINGLE_PARAGRAPH = 40;

/** Lowercases, strips accents/punctuation, collapses whitespace. */
function normalizeForCompare(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Decides whether `title` (Wikipedia's top search hit) is a strong
 * enough match for `query` to surface as a detailed answer, rather than
 * an unrelated article that merely shares a keyword. Prioritizes, in
 * order: exact title match, a close/prefix match, then a
 * strongly-overlapping multi-word match. Deliberately query-agnostic —
 * no per-topic special casing, so it works the same for any search term.
 */
function isRelevantMatch(query, title) {
  const nq = normalizeForCompare(query);
  const nt = normalizeForCompare(title);
  if (!nq || !nt) return false;

  if (nq === nt) return true; // exact title match
  if (nt.startsWith(nq) || nq.startsWith(nt)) return true; // very close match
  if (nt.includes(nq) || nq.includes(nt)) return true; // strongly related (e.g. "Einstein" vs "Albert Einstein")

  // Fallback: most of the query's words show up in the title.
  const queryWords = nq.split(' ').filter(Boolean);
  if (queryWords.length === 0) return false;
  const titleWords = new Set(nt.split(' ').filter(Boolean));
  const overlap = queryWords.filter((word) => titleWords.has(word)).length;
  return overlap / queryWords.length >= 0.6;
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Wikipedia request failed (${response.status})`);
  }
  return response.json();
}

/** Splits a plain-text lead section into trimmed, non-empty paragraphs. */
function splitParagraphs(extract) {
  return (extract || '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function wordCount(text) {
  return (text || '').split(/\s+/).filter(Boolean).length;
}

/**
 * Picks what actually gets shown as the answer: just the first paragraph
 * normally, or the first two if the first one alone is too short to be a
 * useful answer. Never more than two, regardless of how long the lead
 * section is.
 */
function selectDisplayParagraphs(paragraphs) {
  if (paragraphs.length === 0) return [];
  if (paragraphs.length === 1) return paragraphs;

  const firstIsShort = wordCount(paragraphs[0]) < MIN_WORDS_FOR_SINGLE_PARAGRAPH;
  return firstIsShort ? paragraphs.slice(0, 2) : paragraphs.slice(0, 1);
}

/**
 * Fetches the lead section (intro only, plain text) plus thumbnail and
 * canonical URL for an exact article title, in a single request. Returns
 * null for disambiguation pages, missing pages, or pages with no usable
 * intro text — all treated as "no answer" by the caller.
 */
async function fetchArticleAnswer(title, signal) {
  const url =
    `${SEARCH_ENDPOINT}?action=query&format=json&origin=*&redirects=1` +
    `&prop=extracts|pageimages|pageprops|info` +
    `&exintro=1&explaintext=1&exsectionformat=plain` +
    `&piprop=thumbnail&pithumbsize=320` +
    `&ppprop=disambiguation&inprop=url` +
    `&titles=${encodeURIComponent(title)}`;

  const data = await fetchJson(url, signal);
  const pages = data?.query?.pages;
  const page = pages ? Object.values(pages)[0] : null;
  if (!page || page.missing !== undefined) return null;

  // Disambiguation pages ("Mercury" -> planet/element/god/...) don't have
  // a single coherent answer, so treat them the same as no match.
  if (page.pageprops && 'disambiguation' in page.pageprops) return null;

  const paragraphs = selectDisplayParagraphs(splitParagraphs(page.extract));
  if (paragraphs.length === 0) return null;

  return {
    found: true,
    title: page.title,
    paragraphs,
    thumbnail: page.thumbnail?.source || null,
    url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
  };
}

/**
 * Searches Wikipedia for `query` and returns the first candidate that's
 * both relevant and resolves to actual (non-disambiguation) lead-section
 * text. Checking a few candidates instead of only the single top hit
 * matters because the #1 search result for a topic is sometimes a
 * disambiguation page itself (e.g. a bare "Python" search) — in that
 * case the next relevant hit (e.g. "Python (programming language)") is
 * what should become the answer, rather than giving up entirely.
 */
async function findBestAnswer(query, signal) {
  const url =
    `${SEARCH_ENDPOINT}?action=query&list=search&format=json&origin=*` +
    `&srlimit=3&srsearch=${encodeURIComponent(query)}`;

  const data = await fetchJson(url, signal);
  const hits = data?.query?.search ?? [];
  const relevantTitles = hits
    .filter((hit) => hit?.title && isRelevantMatch(query, hit.title))
    .map((hit) => hit.title);

  for (const title of relevantTitles) {
    try {
      // eslint-disable-next-line no-await-in-loop -- candidates must be tried in relevance order, not concurrently
      const answer = await fetchArticleAnswer(title, signal);
      if (answer) return answer;
    } catch (err) {
      if (err?.name === 'AbortError') throw err;
      // This candidate failed (404, transient error, etc) — fall through
      // and try the next one instead of giving up on the whole lookup.
    }
  }

  return null;
}

/**
 * Searches Wikipedia for `query` and returns a normalized detailed
 * answer, or `{ found: false }` when there's no sufficiently relevant
 * article, the query is empty, or the lookup fails for any reason.
 * Wikipedia is purely an enhancement — this function is designed to
 * never throw for ordinary failures, so a slow/broken Wikipedia endpoint
 * can never break the main search flow that calls it alongside this.
 *
 * The one exception is an aborted request (AbortError), which is
 * rethrown so callers using AbortController can tell "cancelled" apart
 * from "no answer" and skip updating state for a stale request.
 *
 * @param {string} query
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{found:false} | {found:true,title:string,paragraphs:string[],thumbnail:string|null,url:string}>}
 */
export async function searchWikipedia(query, { signal } = {}) {
  const trimmed = typeof query === 'string' ? query.trim() : '';
  if (!trimmed) return NOT_FOUND;

  try {
    const answer = await findBestAnswer(trimmed, signal);
    return answer || NOT_FOUND;
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    console.warn('[wikipediaService] searchWikipedia failed:', err);
    return NOT_FOUND;
  }
}
