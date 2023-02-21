/**
 * Util functions for strings.
 */

/**
 * Returns true if a string is a number, false otherwise.
 */
export function isNumeric(word: string): boolean {
  return !isNaN(+word);
}
