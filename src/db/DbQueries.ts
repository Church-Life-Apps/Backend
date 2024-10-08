/**
 * Strings and functions for DB Queries
 */

import { formatForPostgresTsQuery } from "../utils/StringUtils";
import { LyricType } from "./DbModels";

// Normal Queries
export const QUERY_SELECT_FROM_SONGBOOKS = `SELECT * FROM songbooks`;

export function buildFindSongbookQuery(songbookId: string) {
  return `SELECT * FROM songbooks WHERE id = '${songbookId}';`;
}

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

export function buildUpsertLyricQuery(
  songId: string,
  lyricType: LyricType,
  verseNumber: number,
  lyrics: string,
  searchLyrics: string
): string {
  return `
        INSERT INTO lyrics 
        (song_id, lyric_type, verse_number, lyrics, search_lyrics, inserted_dt, updated_dt)
        VALUES ('${songId}', '${lyricType}', ${verseNumber}, '${lyrics}', to_tsvector('english', '${searchLyrics}'), now(), now())
        ON CONFLICT (song_id, lyric_type, verse_number) DO UPDATE SET
        lyrics = '${lyrics}', search_lyrics = to_tsvector('english', '${searchLyrics}'), updated_dt = now()
        WHERE lyrics.song_id = '${songId}' AND lyrics.lyric_type = '${lyricType}' AND lyrics.verse_number = ${verseNumber}
        RETURNING *
    `.trim();
}

export function buildDeleteLyricsForSongQuery(songId: string): string {
  return `
    DELETE FROM lyrics WHERE song_id = '${songId}'
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
  lyricsJsonString: string,
  requesterName: string,
  requesterEmail: string,
  requesterNote: string
): string {
  return `
        INSERT INTO pending_songs
        (id, songbook_id, number, title, author, music, presentation_order, image_url, audio_url, lyrics, 
          requester_name, requester_email, requester_note, inserted_dt, updated_dt)
        VALUES ('${id}', '${songbookId}', ${number}, '${title}', '${author}', '${music}', '${presentationOrder}',
        '${imageUrl}', '${audioUrl}', '${lyricsJsonString}', '${requesterName}', '${requesterEmail}', 
        '${requesterNote}', now(), now())
        ON CONFLICT DO NOTHING
        RETURNING *
    `.trim();
}

export const QUERY_SELECT_FROM_PENDING_SONGS =
  "SELECT * FROM pending_songs ORDER BY songbook_id ASC, number ASC";

export function buildGetPendingSongByIdQuery(id: string): string {
  return `SELECT * FROM pending_songs WHERE id = '${id}'`;
}

export function buildDeletePendingSongByIdQuery(id: string): string {
  return `DELETE FROM pending_songs WHERE id = '${id}' RETURNING *`;
}

export function buildSearchSongByNumberQuery(
  songNumber: string,
  songbook: string
): string {
  let songbookClause = "";
  if (songbook !== "") {
    songbookClause = `AND songbook_id = '${songbook}'`;
  }
  return `SELECT * FROM songs 
  WHERE CAST(number AS TEXT) LIKE '${songNumber}%' ${songbookClause} 
  ORDER BY number ASC LIMIT 100`;
}

/**
 * Use a combination of trigram and textsearch to determine a list of up to 20 songs that contain or are similar to the search text
 * 1. Find trgm similarity to the title and columns
 * 2. Find trgm word_similarity to the lyrics column
 * 3. Find the TextSearch (ts) rank against the lyrics
 * 4. Combine above values to determine a score
 * 5. Take the highest score for each song and sort high -> low
 */
export function buildSearchSongsByTextQuery(
  searchText: string,
  songbook: string
): string {
  let songbookClause = "";
  if (songbook !== "") {
    songbookClause = `AND s.songbook_id = '${songbook}'`;
  }
  const lyricSearchText = formatForPostgresTsQuery(searchText);
  return `
  WITH lyrics_table_query AS (
    SELECT
      *,
      (similarity('${searchText}', s.title) +
        similarity('${searchText}', s.author) +
        word_similarity('${searchText}', l.lyrics) +
        ts_rank(l.search_lyrics, to_tsquery('english', '${lyricSearchText}')))
        AS likeness
    FROM songs s LEFT JOIN lyrics l ON s.id = l.song_id
    WHERE (title ILIKE '%${searchText}%' OR title % '${searchText}' 
      OR author ILIKE '%${searchText}%' OR author % '$${searchText}'
      OR l.search_lyrics @@ to_tsquery('english', '${lyricSearchText}') 
      OR l.lyrics %> '${searchText}')
      ${songbookClause}
    ORDER BY (similarity('${searchText}', s.title)  + word_similarity('${searchText}', l.lyrics) + ts_rank(l.search_lyrics, to_tsquery('english', '${lyricSearchText}'))) desc
  )
  SELECT id, songbook_id, number, title, author, music, presentation_order, image_url, audio_url, MAX(likeness) AS max_likeness
  FROM lyrics_table_query
  GROUP BY id, songbook_id, number, title, author, music, presentation_order, image_url, audio_url
  ORDER BY max_likeness DESC, number ASC
  LIMIT 20;
   `.trim();
}

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
        search_lyrics tsvector NOT NULL,
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
        requester_name varchar(500) NOT NULL,
        requester_email varchar(500) NOT NULL,
        requester_note text NOT NULL,
        inserted_dt timestamptz NOT NULL,
        updated_dt timestamptz NOT NULL
    );
`.trim();

export const QUERY_CREATE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_search_lyrics_gin ON lyrics USING GIN(search_lyrics);
  CREATE INDEX IF NOT EXISTS idx_lyrics_trgm ON lyrics USING gin (lyrics gin_trgm_ops);
  CREATE INDEX IF NOT EXISTS idx_songs_title_trgm ON songs USING gin (title gin_trgm_ops);
  CREATE INDEX IF NOT EXISTS idx_songs_author_trgm ON songs USING gin (author gin_trgm_ops);
`;

export const QUERY_DROP_INDEXES = `
  DROP INDEX IF EXISTS idx_search_lyrics_gin;
  DROP INDEX IF EXISTS idx_lyrics_trgm;
  DROP INDEX IF EXISTS idx_songs_title_trgm;
  DROP INDEX IF EXISTS idx_songs_author_trgm;
`;
