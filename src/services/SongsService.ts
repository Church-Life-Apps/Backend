import {DbLyric, DbSong, DbSongbook, DbSongWithLyrics} from '../db/DbModels';
import {SongsDb} from '../db/SongsDb';

export class SongsService {
  songsDb: SongsDb;

  constructor() {
    this.songsDb = new SongsDb(null);
  }

  // INSERT Functions
  async insertSongbookMethod(songbook: DbSongbook): Promise<DbSongbook> {
    return await this.songsDb.insertSongbook(songbook);
  }

  async upsertSongMethod(song: DbSong): Promise<DbSong> {
    return await this.songsDb.upsertSong(song);
  }

  async insertLyricMethod(lyric: DbLyric): Promise<DbLyric> {
    return await this.songsDb.insertLyric(lyric);
  }

  // SELECT Functions
  async getSongbooks(): Promise<DbSongbook[]> {
    return await this.songsDb.querySongbooks();
  }

  async getSongsMethod(songbookId: string): Promise<DbSong[]> {
    return await this.songsDb.querySongsForSongbook(songbookId);
  }

  async getSongWithLyricsMethod(
    songbookId: string,
    number: number
  ): Promise<DbSongWithLyrics> {
    return await this.songsDb.querySongWithLyrics(songbookId, number);
  }
}
