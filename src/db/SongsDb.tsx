/**
 * Database Layer Code
 */

import {Pool} from 'pg';
import {QUERY_INSERT_SONGBOOK, QUERY_SELECT_FROM_SONGBOOKS} from './DbQueries';
require('dotenv').config();

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

export async function querySongbooks(): Promise<any[]> {
  return await queryDb(QUERY_SELECT_FROM_SONGBOOKS);
}

export async function insertSongbook(): Promise<any[]> {
  return await queryDb(QUERY_INSERT_SONGBOOK);
}

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
