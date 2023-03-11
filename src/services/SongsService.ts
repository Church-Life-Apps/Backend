import {
  DbLyric,
  DbPendingSong,
  DbSong,
  DbSongbook,
  DbSongWithLyrics,
  pendingSongToSong,
} from '../db/DbModels';
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
    return await this.songsDb.upsertLyric(lyric);
  }

  async insertPendingSongMethod(
    pendingSong: DbPendingSong
  ): Promise<DbPendingSong> {
    return await this.songsDb.insertPendingSong(pendingSong);
  }

  async rejectPendingSongMethod(
    pendingSong: DbPendingSong,
    rejectionReason: string
  ): Promise<boolean> {
    const deletedSong = await this.songsDb.deletePendingSong(pendingSong.id);
    if (deletedSong != null) {
      console.log(
        `Deleted pending song: ${deletedSong.title}; Requested by: ${deletedSong.requesterName}; With rejection reason: ${rejectionReason}.`
      );
      // TODO: Send a loving and gentle email to ${deletedSong.requesterEmail} notifying them their song has been rejected.
      return true;
    } else {
      console.log(`Pending song ${pendingSong.id} not found.`);
      return false;
    }
  }

  async acceptPendingSongMethod(
    pendingSong: DbPendingSong,
    acceptanceNote: string
  ): Promise<boolean> {
    await this.songsDb.acceptPendingSong(pendingSong);

    console.log(
      `Accepted pending song: ${pendingSong.title}; Requested by: ${pendingSong.requesterName}; With acceptance note: ${acceptanceNote}`
    );
    // TODO: Send an appreciative email to ${pendingSong.requesterEmail} with ${acceptanceNote} message,
    // And a link to the song they just submitted.

    return true;
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

  async getPendingSongs(): Promise<DbPendingSong[]> {
    return await this.songsDb.queryPendingSongs();
  }
}
