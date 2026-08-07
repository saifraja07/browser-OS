/**
 * Path helpers for VirtualFS. All paths are POSIX-style, absolute, and
 * rooted at "/". No drive letters, no relative paths — keeps this simple
 * and unambiguous for a virtual, single-root filesystem.
 */

export function normalizePath(path) {
  if (!path || path === '/') return '/';
  const parts = path.split('/').filter(Boolean);
  return '/' + parts.join('/');
}

export function splitPath(path) {
  return normalizePath(path).split('/').filter(Boolean);
}

export function joinPath(...segments) {
  return normalizePath(segments.join('/'));
}

export function dirname(path) {
  const parts = splitPath(path);
  parts.pop();
  return parts.length ? '/' + parts.join('/') : '/';
}

export function basename(path) {
  const parts = splitPath(path);
  return parts.length ? parts[parts.length - 1] : '';
}

export function isRoot(path) {
  return normalizePath(path) === '/';
}

/**
 * Resolves `target` against `base`, handling "." and ".." segments and
 * both absolute ("/foo") and relative ("foo", "../foo") targets.
 * Used by Terminal's `cd`/`ls`/etc. for shell-like path arguments.
 */
export function resolvePath(base, target) {
  if (!target || target === '.') return normalizePath(base);

  const isAbsolute = target.startsWith('/');
  const stack = isAbsolute ? [] : splitPath(base);

  for (const segment of target.split('/').filter(Boolean)) {
    if (segment === '.') continue;
    else if (segment === '..') stack.pop();
    else stack.push(segment);
  }

  return stack.length ? '/' + stack.join('/') : '/';
}
