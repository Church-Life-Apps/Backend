import {DbSong, DbSongbook} from '../db/DbModels';
import {insertSongbook, querySongsForSongbook} from '../db/SongsDb';

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
