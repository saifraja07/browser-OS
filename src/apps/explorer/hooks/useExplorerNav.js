import { useCallback, useEffect, useRef, useState } from 'react';
import { virtualFS } from '../../../core/filesystem/virtualFS';
import { dirname } from '../../../core/filesystem/pathUtils';

export function useExplorerNav(initialPath = '/') {
  const [path, setPath] = useState(initialPath);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const historyRef = useRef([]); // back-navigation stack

  const refresh = useCallback(async (targetPath) => {
    setLoading(true);
    try {
      const list = await virtualFS.readDir(targetPath);
      setEntries(list);
    } catch {
      // Folder vanished (deleted from elsewhere) — bounce to its nearest
      // existing ancestor rather than showing a dead window.
      const parent = dirname(targetPath);
      if (parent !== targetPath && (await virtualFS.exists(parent))) {
        setPath(parent);
        return;
      }
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh(path);
  }, [path, refresh]);

  // Live-refresh when VirtualFS changes anywhere — cheap since readDir is
  // an in-memory lookup, and keeps multiple Explorer windows in sync.
  useEffect(() => {
    const unsubscribe = virtualFS.subscribe(() => refresh(path));
    return unsubscribe;
  }, [path, refresh]);

  const navigate = useCallback((newPath) => {
    setPath((current) => {
      if (newPath === current) return current;
      historyRef.current.push(current);
      return newPath;
    });
  }, []);

  const goBack = useCallback(() => {
    const previous = historyRef.current.pop();
    if (previous !== undefined) setPath(previous);
  }, []);

  const goUp = useCallback(() => {
    setPath((current) => {
      const parent = dirname(current);
      if (parent === current) return current;
      historyRef.current.push(current);
      return parent;
    });
  }, []);

  return {
    path,
    entries,
    loading,
    canGoBack: historyRef.current.length > 0,
    navigate,
    goBack,
    goUp,
    refresh: () => refresh(path),
  };
}
