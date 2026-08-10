import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPost, fetchPosts } from '../guestbookService';

const SEARCH_DEBOUNCE_MS = 250;

/**
 * Owns all Community app data state: the post list (loading/error/data),
 * a debounced search query, and post submission (with its own
 * submitting/error state so the create-post view never risks a double
 * submit). Client-side filtering is used for now since the guestbook is
 * expected to stay small; `fetchPosts` is the single seam to swap in
 * server-side search later without touching any component.
 */
export function useGuestbook() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message || "Couldn't load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const filteredPosts = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return posts;
    return posts.filter(
      (post) =>
        post.name.toLowerCase().includes(query) ||
        post.message.toLowerCase().includes(query)
    );
  }, [posts, debouncedSearch]);

  const submitPost = useCallback(async ({ name, message }) => {
    if (submitting) return { ok: false }; // guards against rapid double-taps

    setSubmitting(true);
    setSubmitError(null);

    try {
      const post = await createPost({ name, message });
      setPosts((current) => [post, ...current]);
      setSubmitting(false);
      return { ok: true };
    } catch (err) {
      setSubmitting(false);
      const message = err.message || "Couldn't post your message. Please try again.";
      setSubmitError({ message, code: err.code });
      return { ok: false, error: { message, code: err.code } };
    }
  }, [submitting]);

  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  return {
    posts: filteredPosts,
    totalCount: posts.length,
    loading,
    error,
    retry: loadPosts,
    searchInput,
    setSearchInput,
    isSearching: searchInput.trim().length > 0,
    submitting,
    submitError,
    clearSubmitError,
    submitPost,
  };
}
