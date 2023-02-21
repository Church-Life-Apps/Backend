import {DbSongbook} from '../db/DbModels';
import {isNumeric} from '../utils/StringUtils';
import {ValidationError} from './ErrorHelpers';

/**
 * Validates the request of InsertSongbook API
 */
export function validateInsertSongbookRequest(songbook: DbSongbook) {
  validateString(songbook.id, 'id');
  validateString(songbook.fullName, 'fullName');
}

/**
 * Validates the request of GetSongs API
 */
export function validateGetSongsRequest(songbookId: string) {
  validateString(songbookId, 'songbookId');
}

/**
 * Validates the request of a GetSong API
 */
export function validateGetSongRequest(songbookId: string, number: string) {
  validateString(songbookId, 'songbookId');
  validateIntegerGreaterThanZero(number, 'number');
}

/**
 * Validates a string.
 */
function validateString(data: string, fieldName: string) {
  if (data.trim().length <= 0) {
    throw new ValidationError(`${fieldName} is required.`);
  }
}

/**
 * Validates a string is a number greater than 0.
 */
function validateIntegerGreaterThanZero(data: string, fieldName: string) {
  if (!isNumeric(data)) {
    throw new ValidationError(`${fieldName} is required and must be a number.`);
  }
  const value = parseInt(data);
  if (value <= 0) {
    throw new ValidationError(`${fieldName} must be greater than 0.`);
  }
}
