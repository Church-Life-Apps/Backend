/**
 * Database Layer Code
 */

import {Pool, PoolClient} from 'pg';
import {DatabaseError} from '../helpers/ErrorHelpers';
import {SongWithMatchedText} from '../models/ApiModels';
import {formatForDbEntry} from '../utils/StringUtils';
import {
  DbLyric,
  DbPendingSong,
  DbSong,
  DbSongbook,
  DbSongWithLyrics,
} from './DbModels';
import {
  buildDeletePendingSongByIdQuery,
  buildGetPendingSongByIdQuery,
  buildGetSongsForSongbookQuery,
  buildGetSongWithLyricsQuery,
  buildUpsertLyricQuery,
  buildInsertPendingSongQuery,
  buildInsertSongbookQuery,
  buildUpsertSongQuery,
  QUERY_SELECT_FROM_PENDING_SONGS,
  QUERY_SELECT_FROM_SONGBOOKS,
  buildDeleteLyricsForSongQuery,
  buildSearchSongByNumberQuery,
  buildSearchSongByLyricsQuery,
} from './DbQueries';
require('dotenv').config();

// Setup
const defaultPool = new Pool({
  host: process.env.PG_HOST,
  port: (process.env.PG_PORT || 25060) as number,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: {
    ca: process.env.DB_CERT,
  },
});

export class SongsDb {
  private pool: Pool;

  constructor(pool: Pool | null) {
    if (pool == null) {
      this.pool = defaultPool;
    } else {
      this.pool = pool;
    }
  }

  /**
   * Queries all rows from songbooks table
   */
  async querySongbooks(): Promise<DbSongbook[]> {
    return await this.queryDb(QUERY_SELECT_FROM_SONGBOOKS).then((rows) => {
      return rows.map((row) => this.mapDbSongbook(row));
    });
  }

  /**
   * Lists all songs for a songbook
   */
  async querySongsForSongbook(songbookId: string): Promise<DbSong[]> {
    return await this.queryDb(buildGetSongsForSongbookQuery(songbookId)).then(
      (rows) => {
        return rows.map((row) => this.mapDbSong(row));
      }
    );
  }

  /**
   * Queries for a song with its lyrics for a song based on songbook and number
   */
  async querySongWithLyrics(
    songbookId: string,
    number: number
  ): Promise<DbSongWithLyrics> {
    return await this.queryDb(
      buildGetSongWithLyricsQuery(songbookId, number)
    ).then((rows) => {
      if (rows.length <= 0) {
        throw new DatabaseError(`Song not found for ${songbookId}: ${number}`);
      }
      return this.mapDbSongWithLyric(rows);
    });
  }

  /**
   * Queries all rows from pending_songs table
   */
  async queryPendingSongs(): Promise<DbPendingSong[]> {
    return await this.queryDb(QUERY_SELECT_FROM_PENDING_SONGS).then((rows) => {
      return rows.map((row) => this.mapDbPendingSong(row));
    });
  }

  /**
   * Gets row from pending_songs table by id
   */
  async getPendingSongById(id: string): Promise<DbPendingSong> {
    return await this.queryDb(buildGetPendingSongByIdQuery(id)).then((rows) => {
      if (rows.length <= 0) {
        throw new DatabaseError(`No Pending Song found for id: ${id}`);
      }
      return this.mapDbPendingSong(rows);
    });
  }

  /**
   * Inserts a DbSongbook into the songbooks table
   */
  async insertSongbook(songbook: DbSongbook): Promise<DbSongbook> {
    return await this.queryDb(
      buildInsertSongbookQuery(
        songbook.id,
        songbook.fullName,
        songbook.staticMetadataLink,
        songbook.imageUrl,
        songbook.openToNewSongs
      )
    ).then((rows) => {
      if (rows.length > 0) {
        return rows.map((row) => this.mapDbSongbook(row))[0];
      } else {
        throw new DatabaseError('Unable to insert Songbook');
      }
    });
  }

  /**
   * Inserts or Updates a DbSong into the songs table
   */
  async upsertSong(song: DbSong): Promise<DbSong> {
    return await this.queryDb(
      buildUpsertSongQuery(
        song.id,
        song.songbookId,
        song.number,
        formatForDbEntry(song.title),
        formatForDbEntry(song.author),
        formatForDbEntry(song.music),
        formatForDbEntry(song.presentationOrder),
        song.imageUrl,
        song.audioUrl
      )
    ).then((rows) => {
      if (rows.length > 0) {
        return this.mapDbSong(rows[0]);
      } else {
        throw new DatabaseError('Unable to insert song.');
      }
    });
  }

  /**
   * Inserts or updates a DbLyric into the lyrics table
   */
  async upsertLyric(lyric: DbLyric): Promise<DbLyric> {
    return await this.queryDb(
      buildUpsertLyricQuery(
        lyric.songId,
        lyric.lyricType,
        lyric.verseNumber,
        formatForDbEntry(lyric.lyrics),
        formatForDbEntry(lyric.searchLyrics)
      )
    ).then((rows) => {
      if (rows.length > 0) {
        return this.mapDbLyric(rows[0]);
      } else {
        throw new DatabaseError('Unable to insert lyric');
      }
    });
  }

  /**
   * Inserts a DbPendingSong into the pending_songs table
   */
  async insertPendingSong(pendingSong: DbPendingSong): Promise<DbPendingSong> {
    return await this.queryDb(
      buildInsertPendingSongQuery(
        pendingSong.id,
        pendingSong.songbookId,
        pendingSong.number,
        formatForDbEntry(pendingSong.title),
        formatForDbEntry(pendingSong.author),
        formatForDbEntry(pendingSong.music),
        pendingSong.presentationOrder,
        pendingSong.imageUrl,
        pendingSong.audioUrl,
        formatForDbEntry(JSON.stringify(pendingSong.lyrics)),
        formatForDbEntry(pendingSong.requesterName),
        formatForDbEntry(pendingSong.requesterEmail),
        formatForDbEntry(pendingSong.requesterNote)
      )
    ).then((rows) => {
      if (rows.length > 0) {
        return this.mapDbPendingSong(rows[0]);
      } else {
        throw new DatabaseError('Unable to insert pending song.');
      }
    });
  }

  /**
   * Deletes a DbPendingSong row based on id
   */
  async deletePendingSong(id: string): Promise<DbPendingSong | null> {
    return await this.queryDb(buildDeletePendingSongByIdQuery(id)).then(
      (rows) => {
        if (rows.length > 0) {
          return this.mapDbPendingSong(rows[0]);
        } else {
          return null;
        }
      }
    );
  }

  /**
   * Accepts a Pending Song.
   *
   * In a Db Transaction:
   * 1. Delete the row in the 'pending_songs' table which has the same id.
   * 2. Insert or Update the row in the 'songs' table which this pendingSong pertains to.
   * 3. Delete the rows in the 'lyrics' table that the song had previously.
   * 4. Insert new rows in the 'lyrics' table which these lyrics pertain to.
   * If any of the steps above fails, then roll back the transaction and there should be no change to the database.
   * If all 4 steps above succeed, then commit the transaction and return the updated song.
   */
  async acceptPendingSong(pendingSong: DbPendingSong): Promise<void> {
    const client: PoolClient = await this.pool.connect();
    try {
      // Start Transaction
      await this.queryWithLog('BEGIN', client);
      // Delete Pending Song - If it's empty then throw due to no prior pending song.
      await this.queryWithLog(
        buildDeletePendingSongByIdQuery(pendingSong.id),
        client
      ).then((res) => {
        if (res.rows.length <= 0) {
          throw new DatabaseError(`Pending Song ${pendingSong.id} not found.`);
        }
      });

      // Update the existing song, and use the response.
      const upsertSongResponse = await this.queryWithLog(
        buildUpsertSongQuery(
          pendingSong.id,
          pendingSong.songbookId,
          pendingSong.number,
          formatForDbEntry(pendingSong.title),
          formatForDbEntry(pendingSong.author),
          formatForDbEntry(pendingSong.music),
          formatForDbEntry(pendingSong.presentationOrder),
          pendingSong.imageUrl,
          pendingSong.audioUrl
        ),
        client
      );
      if (upsertSongResponse.rows.length <= 0) {
        throw new DatabaseError(
          `Failed to make updates to 'songs' table for pending song request ${pendingSong.title}; ${pendingSong.songbookId}: ${pendingSong.number}`
        );
      }
      const updatedSongId = upsertSongResponse.rows[0].id;

      // Delete prior lyrics for this song
      await this.queryWithLog(
        buildDeleteLyricsForSongQuery(updatedSongId),
        client
      );

      // Insert new lyrics for this song
      pendingSong.lyrics.forEach(async (lyric) => {
        await this.queryWithLog(
          buildUpsertLyricQuery(
            updatedSongId,
            lyric.lyricType,
            lyric.verseNumber,
            formatForDbEntry(lyric.lyrics),
            formatForDbEntry(lyric.searchLyrics)
          ),
          client
        );
      });

      // If all went well, then commit the transaction.
      await this.queryWithLog('COMMIT', client);
    } catch (e: any) {
      // If there was an error along the way then roll the whole transaction back.
      await this.queryWithLog('ROLLBACK', client);
      throw e;
    } finally {
      client.release();
    }
  }

  async searchSongsByNumber(
    songNumber: string,
    songbook: string
  ): Promise<DbSong[]> {
    const response = await this.queryDb(
      buildSearchSongByNumberQuery(songNumber, songbook)
    );
    return response.map((row) => this.mapDbSong(row));
  }

  async searchSongsByText(
    searchText: string,
    songbook: string
  ): Promise<DbSong[]> {
    const response = await this.queryDb(
      buildSearchSongByLyricsQuery(
        formatForDbEntry(searchText),
        formatForDbEntry(songbook)
      )
    );
    return response.map((row) => this.mapDbSong(row));
  }

  /**
   * Maps a database row to a DbSongbook object.
   */
  private mapDbSongbook(row: any): DbSongbook {
    return {
      id: row.id ?? '',
      fullName: row.full_name ?? '',
      staticMetadataLink: row.static_metadata_link ?? '',
      imageUrl: row.image_url ?? '',
      openToNewSongs: row.open_to_new_songs ?? false,
    };
  }

  /**
   * Maps a database row to a DbSong object
   */
  private mapDbSong(row: any): DbSong {
    return {
      id: row.id ?? '',
      songbookId: row.songbook_id ?? '',
      number: row.number ?? 0,
      title: row.title ?? '',
      author: row.author ?? '',
      music: row.music ?? '',
      presentationOrder: row.presentation_order ?? '',
      imageUrl: row.image_url ?? '',
      audioUrl: row.audio_url ?? '',
    };
  }

  /**
   * Maps a database row to a DbLyric object
   */
  private mapDbLyric(row: any): DbLyric {
    return {
      songId: row.song_id ?? '',
      lyricType: row.lyric_type ?? '',
      verseNumber: row.verse_number ?? '',
      lyrics: row.lyrics ?? '',
      searchLyrics: row.search_lyrics ?? '',
    };
  }

  /**
   * Maps a database row to a DbPendingSong object
   */
  private mapDbPendingSong(row: any): DbPendingSong {
    return {
      id: row.id ?? '',
      songbookId: row.songbook_id ?? '',
      number: row.number ?? 0,
      title: row.title ?? '',
      author: row.author ?? '',
      music: row.music ?? '',
      presentationOrder: row.presentation_order ?? '',
      imageUrl: row.image_url ?? '',
      audioUrl: row.audio_url ?? '',
      lyrics: JSON.parse(row.lyrics ?? '[]'),
      requesterName: row.requester_name ?? '',
      requesterEmail: row.requester_email ?? '',
      requesterNote: row.requester_note ?? '',
    };
  }

  /**
   * Maps a set of rows to a DbSongWithLyric object.
   * Requires that all the lyrics are associated with the same song.
   */
  private mapDbSongWithLyric(rows: any): DbSongWithLyrics {
    return {
      song: this.mapDbSong(rows[0]),
      lyrics: rows
        .filter((row: any) => {
          return this.mapDbLyric(row).lyrics.length > 0;
        })
        .map((row: any) => this.mapDbLyric(row)),
    };
  }

  /**
   * Database query wrapper function
   */
  private async queryDb(query: string): Promise<any[]> {
    console.log(`Database Query: "${query}".`);
    return this.pool
      .query(query)
      .then((res) => {
        console.log(`Returning ${res.rowCount} rows.`);
        return res.rows;
      })
      .catch((err) => {
        console.error(`Error due to: ${err}.`, err);
        return [];
      });
  }

  /**
   * Database Query wrapper function which is expected to return no rows.
   */
  private async queryDbVoid(query: string): Promise<void> {
    console.log(`Database Query: "${query}".`);
    return this.pool
      .query(query)
      .then(() => {
        console.log(`Query ran successfully.`);
      })
      .catch((err) => {
        console.error(`Error due to: ${err}.`, err);
      });
  }

  private async queryWithLog(query: string, client: PoolClient) {
    console.log(`Database Query: "${query}".`);
    return await client.query(query);
  }

  /** One time set up function. Never needs to be called again unless our DB gets nuked.
export async function oneTimeSetUp(): Promise<void> {
    await queryDbVoid(QUERY_CREATE_SONGBOOKS_TABLE);
    await queryDbVoid(QUERY_CREATE_SONGS_TABLE);
    await queryDbVoid(QUERY_CREATE_LYRIC_TYPE_ENUM);
    await queryDbVoid(QUERY_CREATE_LYRICS_TABLE);
    await queryDbVoid(QUERY_CREATE_PENDING_SONGS_TABLE);
}
*/
}
