import { validate } from "uuid";
import { ValidationError } from "./ErrorHelpers";
import {
  Songbook,
  Song,
  Lyric,
  PendingSong,
  AcceptPendingSongRequest,
  RejectPendingSongRequest,
  SearchRequest,
} from "../models/ApiModels";

/**
 * Validates a string.
 */
function validateString(data: string, fieldName: string) {
  if (data.trim().length <= 0) {
    throw new ValidationError(`${fieldName} is required.`);
  }
}

/**
 * Validates a Songbook object.
 */
function validateSongbook(songbook: Songbook, prefix: string) {
  validateString(songbook.id, `${prefix}id`);
  validateString(songbook.fullName, `${prefix}fullName`);
}

/**
 * Validates a string is a valid uuid.
 */
function validateUuid(data: string, fieldName: String) {
  if (!validate(data) || data === "00000000-0000-0000-0000-000000000000") {
    throw new ValidationError(`${fieldName} is not a valid UUID.`);
  }
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
 * Validates a Song object.
 */
function validateSong(song: Song, prefix: string) {
  validateUuid(song.id, `${prefix}id`);
  validateString(song.songbookId, `${prefix}songbookId`);
  validateIntegerGreaterThanZero(song.number, `${prefix}number`);
  validateString(song.title, `${prefix}title`);
  // validateString(song.author, `${prefix}author`);
  validateString(song.presentationOrder, `${prefix}presentationOrder`);
}
/**
 * Validates a Lyric object.
 */
function validateLyric(lyric: Lyric, prefix: string) {
  validateUuid(lyric.songId, `${prefix}songId`);
  validateIntegerGreaterThanZero(lyric.verseNumber, `${prefix}verseNumber`);
  validateString(lyric.lyrics, `${prefix}lyrics`);
}

/**
 * Validates a PendingSong object.
 */
function validatePendingSong(pendingSong: PendingSong, prefix: string) {
  validateUuid(pendingSong.id, `${prefix}id`);
  validateString(pendingSong.songbookId, `${prefix}songbookId`);
  validateIntegerGreaterThanZero(pendingSong.number, `${prefix}number`);
  validateString(pendingSong.title, `${prefix}title`);
  validateString(pendingSong.author, `${prefix}author`);
  validateString(pendingSong.presentationOrder, `${prefix}presentationOrder`);
  pendingSong.lyrics.forEach((lyric) =>
    validateLyric(lyric, `${prefix}.lyrics.`)
  );
}

/**
 * Validates the request of InsertSongbook API
 */
export function validateInsertSongbookRequest(songbook: Songbook) {
  validateSongbook(songbook, "");
}

/**
 * Validates the request of InsertSong API
 */
export function validateInsertSongRequest(song: Song) {
  validateSong(song, "");
}

/**
 * Validates the request of InsertLyric API
 */
export function validateInsertLyricRequest(lyric: Lyric) {
  validateLyric(lyric, "");
}

/**
 * Validates the request of InsertPendingSongAPI
 */
export function validateInsertPendingSongRequest(pendingSong: PendingSong) {
  validatePendingSong(pendingSong, "");
}

/**
 * Validates the request of RejectPendingSong API
 */
export function validateRejectPendingSongRequest(
  request: RejectPendingSongRequest
) {
  validateUuid(request.pendingSong.id, "id");
  validateString(request.rejectionReason, "rejectionReason");
}

/**
 * Validates the request of AcceptPendingSong API
 */
export function validateAcceptPendingSongRequest(
  request: AcceptPendingSongRequest
) {
  validatePendingSong(request.pendingSong, "pendingSong.");
  validateString(request.acceptanceNote, "acceptanceNote");
}

/**
 * Validates the request of Search API
 */
export function validateSearchRequest(request: SearchRequest) {
  validateString(request.searchText, "searchText");
}

/**
 * Validates the request of GetSongs API
 */
export function validateGetSongsRequest(songbookId: string) {
  validateString(songbookId, "songbookId");
}

/**
 * Validates the request of a GetSong API
 */
export function validateGetSongRequest(songbookId: string, number: number) {
  validateString(songbookId, "songbookId");
  validateIntegerGreaterThanZero(number, "number");
}
