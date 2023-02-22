import {DbLyric, DbSong, DbSongbook} from '../db/DbModels';
import {isNumeric} from '../utils/StringUtils';
import {ValidationError} from './ErrorHelpers';
import {v4 as uuidv4, validate} from 'uuid';

/**
 * Validates the request of InsertSongbook API
 */
export function validateInsertSongbookRequest(songbook: DbSongbook) {
  validateString(songbook.id, 'id');
  validateString(songbook.fullName, 'fullName');
}

/**
 * Validates the request of InsertSong API
 */
export function validateInsertSongRequest(song: DbSong) {
  validateUuid(song.id, 'id');
  validateString(song.songbookId, 'songbookId');
  validateIntegerGreaterThanZero(song.number, 'number');
  validateString(song.title, 'title');
  validateString(song.author, 'author');
  validateString(song.presentationOrder, 'presentationOrder');
}

/**
 * Validates the request of InsertLyric API
 */
export function validateInsertLyricRequest(lyric: DbLyric) {
  validateUuid(lyric.songId, 'songId');
  validateIntegerGreaterThanZero(lyric.verseNumber, 'verseNumber');
  validateString(lyric.lyrics, 'lyrics');
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
  validateStringIntegerGreaterThanZero(number, 'number');
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
function validateStringIntegerGreaterThanZero(data: string, fieldName: string) {
  if (!isNumeric(data)) {
    throw new ValidationError(`${fieldName} is required and must be a number.`);
  }
  const value = parseInt(data);
  validateIntegerGreaterThanZero(value, fieldName);
}

/**
 * Validates a string is a number greater than 0.
 */
function validateIntegerGreaterThanZero(data: number, fieldName: string) {
  if (data <= 0) {
    throw new ValidationError(`${fieldName} must be greater than 0.`);
  }
}

/**
 * Validates a string is a valid uuid.
 */
function validateUuid(data: typeof uuidv4, fieldName: String) {
  if (
    !validate(data.toString()) ||
    data.toString() == '00000000-0000-0000-0000-000000000000'
  ) {
    throw new ValidationError(`${fieldName} is not a valid UUID.`);
  }
}
