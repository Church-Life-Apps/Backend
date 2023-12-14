import SongsDb from "../db/SongsDb";
import {
  Lyric,
  PendingSong,
  Song,
  Songbook,
  SongWithLyrics,
} from "../models/ApiModels";
import { toDbPendingSong } from "../models/ModelConversion";
import { isNumeric } from "../utils/StringUtils";

export default class SongsService {
  songsDb: SongsDb;

  constructor() {
    this.songsDb = new SongsDb(null);
  }

  // INSERT Functions
  async insertSongbookMethod(songbook: Songbook): Promise<Songbook> {
    return this.songsDb.insertSongbook(songbook);
  }

  async upsertSongMethod(song: Song): Promise<Song> {
    return this.songsDb.upsertSong(song);
  }

  async insertLyricMethod(lyric: Lyric): Promise<Lyric> {
    return this.songsDb.upsertLyric(lyric);
  }

  async insertPendingSongMethod(
    pendingSong: PendingSong
  ): Promise<PendingSong> {
    return this.songsDb.insertPendingSong(toDbPendingSong(pendingSong));
  }

  async rejectPendingSongMethod(
    pendingSong: PendingSong,
    rejectionReason: string
  ): Promise<boolean> {
    const deletedSong = await this.songsDb.deletePendingSong(pendingSong.id);
    if (deletedSong != null) {
      console.log(
        `Deleted pending song: ${deletedSong.title}; Requested by: ${deletedSong.requesterName}; With rejection reason: ${rejectionReason}.`
      );
      // TODO: Send a loving and gentle email to ${deletedSong.requesterEmail} notifying them their song has been rejected.
      return true;
    }
    console.log(`Pending song ${pendingSong.id} not found.`);
    return false;
  }

  async acceptPendingSongMethod(
    pendingSong: PendingSong,
    acceptanceNote: string
  ): Promise<boolean> {
    await this.songsDb.acceptPendingSong(toDbPendingSong(pendingSong));

    console.log(
      `Accepted pending song: ${pendingSong.title}; Requested by: ${pendingSong.requesterName}; With acceptance note: ${acceptanceNote}`
    );
    // TODO: Send an appreciative email to ${pendingSong.requesterEmail} with ${acceptanceNote} message,
    // And a link to the song they just submitted.

    return true;
  }

  // SELECT Functions
  async getSongbooks(): Promise<Songbook[]> {
    return this.songsDb.querySongbooks();
  }

  async getSongbook(songbookId: string): Promise<Songbook> {
    return this.songsDb.querySongbook(songbookId);
  }

  async getSongsMethod(songbookId: string): Promise<Song[]> {
    return this.songsDb.querySongsForSongbook(songbookId);
  }

  async getSongWithLyricsMethod(
    songbookId: string,
    number: number
  ): Promise<SongWithLyrics> {
    return this.songsDb.querySongWithLyrics(songbookId, number);
  }

  async getPendingSongs(): Promise<PendingSong[]> {
    return this.songsDb.queryPendingSongs();
  }

  async searchSongs(searchText: string, songbook: string): Promise<Song[]> {
    if (isNumeric(searchText)) {
      return this.songsDb.searchSongsByNumber(searchText, songbook);
    }
    return this.songsDb.searchSongsByText(searchText, songbook);
  }
}
