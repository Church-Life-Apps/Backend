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
 * Removes special characters from the string.
 */
export function removePunctuation(s: string): string {
  return s.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, '');
}

/**
 * Replaces occurences of 2 or more spaces with a single space.
 */
export function removeDoubleSpaces(s: string): string {
  return s.replace(/\s{2,}/g, ' ');
}

export function toLowerCase() {}

/**
 * Formats a string for entry into the Postgres DB.
 *
 * 1. Replaces single quotes with two single quotes.
 */
export function formatForDbEntry(text: string): string {
  return text.replace(/'/g, "''");
}

/**
 * Formats a string for entry as a text search column into the PostgresDb.
 *
 * 1. Removes all punctuation.
 * 2. Removes double spaces.
 * 3. Makes lower case.
 */
export function formatForDbSearchColumn(text: string): string {
  return removeDoubleSpaces(removePunctuation(text)).toLowerCase();
}
