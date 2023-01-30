import {DbSongbook} from '../db/DbModels';
import {insertSongbook} from '../db/SongsDb';

/**
 * Service logic for insertSongbook API
 */
export async function insertSongbookMethod(
  songbook: DbSongbook
): Promise<DbSongbook> {
  return await insertSongbook(songbook);
}
