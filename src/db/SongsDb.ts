/**
 * Database Layer Code
 */

import {it} from 'node:test';
import {Pool} from 'pg';
import {DatabaseError} from '../helpers/ErrorHelpers';
import {formatForDbEntry} from '../utils/StringUtils';
import {DbLyric, DbSong, DbSongbook, DbSongWithLyrics} from './DbModels';
import {
  buildGetSongsForSongbookQuery,
  buildGetSongWithLyricsQuery,
  buildInsertLyricQuery,
  buildInsertSongbookQuery,
  buildInsertSongQuery,
  QUERY_SELECT_FROM_SONGBOOKS,
} from './DbQueries';
require('dotenv').config();

// Setup
const pool = new Pool({
  host: process.env.PG_HOST,
  port: (process.env.PG_PORT || 25060) as number,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: {
    ca: process.env.DB_CERT,
  },
});

/**
 * Queries all rows from songbooks table
 */
export async function querySongbooks(): Promise<DbSongbook[]> {
  return await queryDb(QUERY_SELECT_FROM_SONGBOOKS).then((rows) => {
    return rows.map((row) => mapDbSongbook(row));
  });
}

/**
 * Lists all songs for a songbook
 */
export async function querySongsForSongbook(
  songbookId: string
): Promise<DbSong[]> {
  return await queryDb(buildGetSongsForSongbookQuery(songbookId)).then(
    (rows) => {
      return rows.map((row) => mapDbSong(row));
    }
  );
}

/**
 * Queries for a song with its lyrics for a song based on songbook and number
 */
export async function querySongWithLyrics(
  songbookId: string,
  number: number
): Promise<DbSongWithLyrics> {
  return await queryDb(buildGetSongWithLyricsQuery(songbookId, number)).then(
    (rows) => {
      if (rows.length <= 0) {
        throw new DatabaseError(`Song not found for ${songbookId}: ${number}`);
      }
      return mapDbSongWithLyric(rows);
    }
  );
}

/**
 * Inserts a DbSongbook into the songbooks table
 */
export async function insertSongbook(
  songbook: DbSongbook
): Promise<DbSongbook> {
  return await queryDb(
    buildInsertSongbookQuery(
      songbook.id,
      songbook.fullName,
      songbook.staticMetadataLink,
      songbook.imageUrl
    )
  ).then((rows) => {
    if (rows.length > 0) {
      return rows.map((row) => mapDbSongbook(row))[0];
    } else {
      throw new DatabaseError('Unable to insert Songbook');
    }
  });
}

/**
 * Inserts a DbSong into the songs table
 */
export async function insertSong(song: DbSong): Promise<DbSong> {
  return await queryDb(
    buildInsertSongQuery(
      song.id,
      song.songbookId,
      song.number,
      formatForDbEntry(song.title),
      formatForDbEntry(song.author),
      formatForDbEntry(song.music),
      song.presentationOrder,
      song.imageUrl
    )
  ).then((rows) => {
    if (rows.length > 0) {
      return mapDbSong(rows[0]);
    } else {
      throw new DatabaseError('Unable to insert song.');
    }
  });
}

/**
 * Inserts a DbLyric into the lyrics table
 */
export async function insertLyric(lyric: DbLyric): Promise<DbLyric> {
  return await queryDb(
    buildInsertLyricQuery(
      lyric.songId,
      lyric.lyricType,
      lyric.verseNumber,
      formatForDbEntry(lyric.lyrics)
    )
  ).then((rows) => {
    if (rows.length > 0) {
      return mapDbLyric(rows[0]);
    } else {
      throw new DatabaseError('Unable to insert lyric');
    }
  });
}

/**
 * Maps a database row to a DbSongbook object.
 */
function mapDbSongbook(row: any): DbSongbook {
  return {
    id: row.id ?? '',
    fullName: row.full_name ?? '',
    staticMetadataLink: row.static_metadata_link ?? '',
    imageUrl: row.image_url ?? '',
  };
}

/**
 * Maps a database row to a DbSong object
 */
function mapDbSong(row: any): DbSong {
  return {
    id: row.id ?? '',
    songbookId: row.songbook_id ?? '',
    number: row.number ?? 0,
    title: row.title ?? '',
    author: row.author ?? '',
    music: row.music ?? '',
    presentationOrder: row.presentation_order ?? '',
    imageUrl: row.image_url ?? '',
  };
}

/**
 * Maps a database row to a DbLyric object
 */
function mapDbLyric(row: any): DbLyric {
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
function mapDbSongWithLyric(rows: any): DbSongWithLyrics {
  return {
    song: mapDbSong(rows[0]),
    lyrics: rows
      .filter((row: any) => {
        return mapDbLyric(row).lyrics.length > 0;
      })
      .map((row: any) => mapDbLyric(row)),
  };
}

/**
 * Database query wrapper function
 */
async function queryDb(query: string): Promise<any[]> {
  console.log(`Database Query: "${query}".`);
  return pool
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
async function queryDbVoid(query: string): Promise<void> {
  console.log(`Database Query: "${query}".`);
  return pool
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
