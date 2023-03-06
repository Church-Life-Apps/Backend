/**
 * Database Layer Code
 */

import {Pool} from 'pg';
import {DatabaseError} from '../helpers/ErrorHelpers';
import {formatForDbEntry} from '../utils/StringUtils';
import {DbLyric, DbSong, DbSongbook, DbSongWithLyrics} from './DbModels';
import {
  buildGetSongsForSongbookQuery,
  buildGetSongWithLyricsQuery,
  buildInsertLyricQuery,
  buildInsertSongbookQuery,
  buildUpsertSongQuery,
  QUERY_SELECT_FROM_SONGBOOKS,
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
        song.presentationOrder,
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
   * Inserts a DbLyric into the lyrics table
   */
  async insertLyric(lyric: DbLyric): Promise<DbLyric> {
    return await this.queryDb(
      buildInsertLyricQuery(
        lyric.songId,
        lyric.lyricType,
        lyric.verseNumber,
        formatForDbEntry(lyric.lyrics)
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

  /** One time set up function. Never needs to be called again unless our DB gets nuked.
export async function oneTimeSetUp(): Promise<void> {
    await queryDbVoid(QUERY_CREATE_SONGBOOKS_TABLE);
    await queryDbVoid(QUERY_CREATE_SONGS_TABLE);
    await queryDbVoid(QUERY_CREATE_LYRIC_TYPE_ENUM);
    await queryDbVoid(QUERY_CREATE_LYRICS_TABLE);
}
*/
}
