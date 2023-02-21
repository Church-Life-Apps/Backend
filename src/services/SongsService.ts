import {DbSong, DbSongbook, DbSongWithLyrics} from '../db/DbModels';
import {
  insertSongbook,
  querySongsForSongbook,
  querySongWithLyrics,
} from '../db/SongsDb';

/**
 * Service logic for insertSongbook API
 */
export async function insertSongbookMethod(
  songbook: DbSongbook
): Promise<DbSongbook> {
  return await insertSongbook(songbook);
}

/**
 * Service logic for getSongs API
 */
export async function getSongsMethod(songbookId: string): Promise<DbSong[]> {
  return await querySongsForSongbook(songbookId);
}

/**
 * Service logic for getSongWithLyrics API
 */
export async function getSongWithLyricsMethod(
  songbookId: string,
  number: number
): Promise<DbSongWithLyrics> {
  return await querySongWithLyrics(songbookId, number);
}
