/**
 * Database Layer Code
 */

import {it} from 'node:test';
import {Pool} from 'pg';
import {DbLyric, DbSong, DbSongbook, DbSongWithLyrics} from './DbModels';
import {
  buildGetSongsForSongbookQuery,
  buildInsertSongbookQuery,
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
    return rows.map((row) => mapDbSongbook(row))[0];
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
