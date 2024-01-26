/**
 * Checks if a given string is a valid URL.
 *
 * @param str - The string to check.
 * @returns True if str is a valid URL, false otherwise.
 * @internal
 */
export const isValidUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch (err) {
    return false;
  }
}

export const merge = (a: unknown[], b: unknown[], predicate = (a: unknown, b: unknown) => a === b) => {
  const c = [...a]; // copy to avoid side effects
  // add all items from B to copy C if they're not already present
  b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
  return c;
}