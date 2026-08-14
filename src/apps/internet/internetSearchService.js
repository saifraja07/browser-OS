const BASE_URL = import.meta.env.VITE_BROWSEROS_API_URL;

export const isInternetSearchConfigured = Boolean(BASE_URL);

if (!isInternetSearchConfigured && import.meta.env.DEV) {
  console.warn(
    '[internetSearchService] VITE_BROWSEROS_API_URL is not set. ' +
      'Copy .env.example to .env.local and fill in the deployed API URL to enable Internet search.'
  );
}

function assertConfigured() {
  if (!BASE_URL) {
    const error = new Error(
      "Search isn\u2019t configured yet \u2014 missing VITE_BROWSEROS_API_URL."
    );
    error.code = 'NOT_CONFIGURED';
    throw error;
  }
}

export async function searchInternet(query, { signal } = {}) {
  assertConfigured();

  const url = `${BASE_URL.replace(/\/$/, '')}/internet/search?q=${encodeURIComponent(query)}`;

  let response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    console.error('[internetSearchService] searchInternet network failure:', err);
    const friendly = new Error("Couldn't reach the search service. Please try again.");
    friendly.code = 'NETWORK_ERROR';
    throw friendly;
  }

  let body;
  try {
    body = await response.json();
  } catch {
    console.error('[internetSearchService] searchInternet: non-JSON response', response.status);
    const friendly = new Error('Search service returned an unexpected response.');
    friendly.code = 'INVALID_RESPONSE';
    throw friendly;
  }

  if (!response.ok || body?.success === false) {
    console.error('[internetSearchService] searchInternet failed:', response.status, body);
    const friendly = new Error(body?.message || 'Search failed. Please try again.');
    friendly.code = body?.code || 'SEARCH_FAILED';
    throw friendly;
  }

  return body.data;
}
