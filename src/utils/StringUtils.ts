/**
 * Util functions for strings.
 */

/**
 * Returns true if a string is a number, false otherwise.
 */
export function isNumeric(word: string): boolean {
  return word.length > 0 && !isNaN(+word);
}

/**
 * Formats a string for entry into the Postgres DB.
 *
 * 1. Replaces single quotes with two single quotes.
 */
export function formatForDbEntry(text: string): string {
  return text.replace(/'/g, "''");
}
