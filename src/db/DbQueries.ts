/**
 * Strings and functions for DB Queries
 */

import {formatForDbEntry} from '../utils/StringUtils';
import {DbLyric, LyricType} from './DbModels';

// Normal Queries
export const QUERY_SELECT_FROM_SONGBOOKS = `SELECT * FROM songbooks`;

export function buildInsertSongbookQuery(
  id: string,
  fullName: string,
  staticMetadataLink: string,
  imageUrl: string,
  openToNewSongs: boolean
): string {
  return `
        INSERT INTO songbooks 
        (id, full_name, static_metadata_link, image_url, open_to_new_songs, inserted_dt, updated_dt)
        VALUES ('${id}', '${fullName}', '${staticMetadataLink}','${imageUrl}', '${openToNewSongs}', now(), now())
        ON CONFLICT DO NOTHING
        RETURNING *; 
    `.trim();
}

export function buildUpsertSongQuery(
  id: string,
  songbookId: string,
  number: number,
  title: string,
  author: string,
  music: string,
  presentationOrder: string,
  imageUrl: string,
  audioUrl: string
): string {
  return `
        INSERT INTO songs
        (id, songbook_id, number, title, author, music, presentation_order, image_url, audio_url, inserted_dt, updated_dt)
        VALUES ('${id}', '${songbookId}', ${number}, '${title}', '${author}', '${music}', '${presentationOrder}',
        '${imageUrl}', '${audioUrl}', now(), now())
        ON CONFLICT (songbook_id, number) DO UPDATE SET
        title = '${title}', author = '${author}', music = '${music}', presentation_order = '${presentationOrder}',
        image_url = '${imageUrl}', audio_url = '${audioUrl}', updated_dt = now()
        WHERE songs.songbook_id = '${songbookId}' AND songs.number = '${number}'
        RETURNING *
    `.trim();
}

export function buildInsertLyricQuery(
  songId: string,
  lyricType: LyricType,
  verseNumber: number,
  lyrics: string
): string {
  return `
        INSERT INTO lyrics
        (song_id, lyric_type, verse_number, lyrics, inserted_dt, updated_dt)
        VALUES ('${songId}', '${lyricType}', ${verseNumber}, '${lyrics}', now(), now())
        ON CONFLICT DO NOTHING
        RETURNING *
    `.trim();
}

export function buildGetSongsForSongbookQuery(songbookId: string): string {
  return `
        SELECT * FROM songs
        WHERE songbook_id = '${songbookId}'
        ORDER BY number
    `.trim();
}

export function buildGetSongWithLyricsQuery(
  songbookId: string,
  number: number
): string {
  return `
        SELECT * FROM songs s LEFT JOIN lyrics l ON s.id = l.song_id
        WHERE s.songbook_id = '${songbookId}' AND s.number = ${number}
    `.trim();
}

export function buildInsertPendingSongQuery(
  id: string,
  songbookId: string,
  number: number,
  title: string,
  author: string,
  music: string,
  presentationOrder: string,
  imageUrl: string,
  audioUrl: string,
  lyrics: DbLyric[]
): string {
  return `
        INSERT INTO pending_songs
        (id, songbook_id, number, title, author, music, presentation_order, image_url, audio_url, lyrics, inserted_dt, updated_dt)
        VALUES ('${id}', '${songbookId}', ${number}, '${title}', '${author}', '${music}', '${presentationOrder}',
        '${imageUrl}', '${audioUrl}', 
        '${formatForDbEntry(JSON.stringify(lyrics))}', now(), now())
        ON CONFLICT DO NOTHING
        RETURNING *
    `.trim();
}

export const QUERY_SELECT_FROM_PENDING_SONGS =
  'SELECT * FROM pending_songs ORDER BY songbook_id ASC, number ASC';

// One-time queries below this line! Should only be called by TEST cases :)
export const QUERY_CREATE_SONGBOOKS_TABLE = `
    CREATE TABLE IF NOT EXISTS songbooks (
        id varchar(50) PRIMARY KEY,
        full_name varchar(500) UNIQUE NOT NULL,
        static_metadata_link text NOT NULL,
        image_url text NOT NULL,
        open_to_new_songs boolean NOT NULL,
        inserted_dt timestamptz NOT NULL,
        updated_dt timestamptz NOT NULL
    );
`.trim();

export const QUERY_CREATE_SONGS_TABLE = `
    CREATE TABLE IF NOT EXISTS songs (
        id uuid PRIMARY KEY,
        songbook_id varchar(50) REFERENCES songbooks(id),
        number integer NOT NULL,
        title varchar(500) NOT NULL,
        author varchar(500) NOT NULL,
        music varchar(500) NOT NULL,
        presentation_order text NOT NULL,
        image_url text NOT NULL,
        audio_url text NOT NULL,
        inserted_dt timestamptz NOT NULL,
        updated_dt timestamptz NOT NULL,
        UNIQUE(songbook_id, number)
    );
`.trim();

export const QUERY_CREATE_LYRIC_TYPE_ENUM = `
    CREATE TYPE lyric_type as ENUM (
        'LYRIC_TYPE_VERSE',
        'LYRIC_TYPE_PRECHORUS',
        'LYRIC_TYPE_CHORUS',
        'LYRIC_TYPE_BRIDGE'
    );
`.trim();

export const QUERY_CREATE_LYRICS_TABLE = `
    CREATE TABLE IF NOT EXISTS lyrics (
        song_id uuid NOT NULL REFERENCES songs(id),
        lyric_type lyric_type NOT NULL,
        verse_number integer NOT NULL,
        lyrics text NOT NULL,
        inserted_dt timestamptz NOT NULL,
        updated_dt timestamptz NOT NULL,
        PRIMARY KEY (song_id, lyric_type, verse_number)
    );
`.trim();

export const QUERY_CREATE_PENDING_SONGS_TABLE = `
    CREATE TABLE IF NOT EXISTS pending_songs (
        id uuid PRIMARY KEY,
        songbook_id varchar(50) REFERENCES songbooks(id),
        number integer NOT NULL,
        title varchar(500) NOT NULL,
        author varchar(500) NOT NULL,
        music varchar(500) NOT NULL,
        presentation_order text NOT NULL,
        image_url text NOT NULL,
        audio_url text NOT NULL,
        lyrics text NOT NULL,
        inserted_dt timestamptz NOT NULL,
        updated_dt timestamptz NOT NULL
    );
`.trim();
