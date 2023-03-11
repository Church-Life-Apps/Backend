import {DbLyric, DbPendingSong, DbSong, DbSongbook} from '../db/DbModels';
import {isNumeric} from '../utils/StringUtils';
import {ValidationError} from './ErrorHelpers';
import {v4 as uuidv4, validate} from 'uuid';
import {AcceptPendingSongRequest, RejectPendingSongRequest} from './ApiHelpers';

/**
 * Validates the request of InsertSongbook API
 */
export function validateInsertSongbookRequest(songbook: DbSongbook) {
  validateDbSongbook(songbook, '');
}

/**
 * Validates the request of InsertSong API
 */
export function validateInsertSongRequest(song: DbSong) {
  validateDbSong(song, '');
}

/**
 * Validates the request of InsertLyric API
 */
export function validateInsertLyricRequest(lyric: DbLyric) {
  validateDbLyric(lyric, '');
}

/**
 * Validates the request of InsertPendingSongAPI
 */
export function validateInsertPendingSongRequest(pendingSong: DbPendingSong) {
  validateDbPendingSong(pendingSong, '');
}

/**
 * Validates the request of RejectPendingSong API
 */
export function validateRejectPendingSongRequest(
  request: RejectPendingSongRequest
) {
  validateUuid(request.pendingSong.id, 'id');
  validateString(request.rejectionReason, 'rejectionReason');
}

export function validateAcceptPendingSongRequest(
  request: AcceptPendingSongRequest
) {
  validateDbPendingSong(request.pendingSong, 'pendingSong.');
  validateString(request.acceptanceNote, 'acceptanceNote');
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
 * Validates a DbSongbook object.
 */
function validateDbSongbook(songbook: DbSongbook, prefix: string) {
  validateString(songbook.id, `${prefix}id`);
  validateString(songbook.fullName, `${prefix}fullName`);
}

/**
 * Validates a DbSong object.
 */
function validateDbSong(song: DbSong, prefix: string) {
  validateUuid(song.id, `${prefix}id`);
  validateString(song.songbookId, `${prefix}songbookId`);
  validateIntegerGreaterThanZero(song.number, `${prefix}number`);
  validateString(song.title, `${prefix}title`);
  validateString(song.author, `${prefix}author`);
  validateString(song.presentationOrder, `${prefix}presentationOrder`);
}
/**
 * Validates a DbLyric object.
 */
function validateDbLyric(lyric: DbLyric, prefix: string) {
  validateUuid(lyric.songId, `${prefix}songId`);
  validateIntegerGreaterThanZero(lyric.verseNumber, `${prefix}verseNumber`);
  validateString(lyric.lyrics, `${prefix}lyrics`);
}

/**
 * Validates a DbPendingSong object.
 */
function validateDbPendingSong(pendingSong: DbPendingSong, prefix: string) {
  validateUuid(pendingSong.id, `${prefix}id`);
  validateString(pendingSong.songbookId, `${prefix}songbookId`);
  validateIntegerGreaterThanZero(pendingSong.number, `${prefix}number`);
  validateString(pendingSong.title, `${prefix}title`);
  validateString(pendingSong.author, `${prefix}author`);
  validateString(pendingSong.presentationOrder, `${prefix}presentationOrder`);
  pendingSong.lyrics.forEach((lyric) =>
    validateDbLyric(lyric, `${prefix}.lyrics.`)
  );
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
function validateUuid(data: string, fieldName: String) {
  if (!validate(data) || data == '00000000-0000-0000-0000-000000000000') {
    throw new ValidationError(`${fieldName} is not a valid UUID.`);
  }
}
