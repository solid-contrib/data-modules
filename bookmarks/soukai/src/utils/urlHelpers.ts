/**
 * Returns the root URL for a given URL string.
 *
 * Finds the index of the protocol (e.g. 'http://') and the first '/' after it.
 * Returns the substring from 0 to the end of that first '/'.
 * If no '/' is found, returns the full input URL.
 */
export function urlRoot(url: string): string {
  const protocolIndex = url.indexOf("://") + 3;
  const pathIndex = url.substring(protocolIndex).indexOf("/");

  return pathIndex !== -1 ? url.substring(0, protocolIndex + pathIndex) : url;
}

/**
 * Returns the parent directory URL for the given URL string.
 *
 * Removes any trailing slash from the URL.
 * If the URL is already the root, returns null.
 * Otherwise, finds the last '/' and returns the substring
 * from 0 to that '/' (including it).
 */
export function urlParentDirectory(url: string): string | null {
  if (url.endsWith("/")) url = url.substring(0, url.length - 1);

  if (urlRoot(url) === url) return null;

  const pathIndex = url.lastIndexOf("/");

  return pathIndex !== -1 ? url.substring(0, pathIndex + 1) : null;
}
