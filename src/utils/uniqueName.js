/** Given a desired name and a list of names already taken in the same folder,
 * returns the desired name unchanged if free, or appends " (2)", " (3)", etc. */
export function uniqueName(desiredName, takenNames) {
  const taken = new Set(takenNames);
  if (!taken.has(desiredName)) return desiredName;

  const dotIndex = desiredName.lastIndexOf('.');
  const hasExt = dotIndex > 0;
  const base = hasExt ? desiredName.slice(0, dotIndex) : desiredName;
  const ext = hasExt ? desiredName.slice(dotIndex) : '';

  let i = 2;
  let candidate = `${base} (${i})${ext}`;
  while (taken.has(candidate)) {
    i += 1;
    candidate = `${base} (${i})${ext}`;
  }
  return candidate;
}
