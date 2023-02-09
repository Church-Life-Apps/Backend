import {DbSongbook} from '../db/DbModels';
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
 * Validates a string.
 */
function validateString(data: string, fieldName: string) {
  if (data.trim().length <= 0) {
    throw new ValidationError(`${fieldName} is required.`);
  }
}
