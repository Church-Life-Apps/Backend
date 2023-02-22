import {DbLyric, DbSong, DbSongbook, DbSongWithLyrics} from '../db/DbModels';
import {
  insertLyric,
  insertSong,
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
 * Service logic for insertSong API
 */
export async function insertSongMethod(song: DbSong): Promise<DbSong> {
  return await insertSong(song);
}

/**
 * Service logic for insertLyric API
 */
export async function insertLyricMethod(lyric: DbLyric): Promise<DbLyric> {
  return await insertLyric(lyric);
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
