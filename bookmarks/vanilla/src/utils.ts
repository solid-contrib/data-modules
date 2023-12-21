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