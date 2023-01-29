/**
 * String Constants for DB Queries
 */

// Normal Queries
export const QUERY_SELECT_FROM_SONGBOOKS = `SELECT * FROM songbooks`;

export const QUERY_INSERT_SONGBOOK = `
    INSERT INTO songbooks 
    VALUES(%s, %s, %s, now(), now());
`.trim();

// One-time queries below this line! Keep here just for reference, but never call these :)
/* export */ const QUERY_CREATE_SONGBOOKS_TABLE = `
    CREATE TABLE IF NOT EXISTS songbooks (
        id varchar(50) PRIMARY KEY,
        full_name varchar(500) UNIQUE NOT NULL,
        static_metadata_link text NOT NULL,
        inserted_dt timestamptz NOT NULL,
        updated_dt timestamptz NOT NULL
    );
`.trim();

/* export */ const QUERY_CREATE_SONGS_TABLE = `
    CREATE TABLE IF NOT EXISTS songs (
        id uuid PRIMARY KEY,
        songbook_id varchar(50) REFERENCES songbooks(id),
        number integer NOT NULL,
        title varchar(500) NOT NULL,
        author varchar(500) NOT NULL,
        music varchar(500) NOT NULL,
        image_url text NOT NULL,
        inserted_dt timestamptz NOT NULL,
        updated_dt timestamptz NOT NULL,
        UNIQUE(songbook_id, number)
    );
`.trim();

/* export */ const QUERY_CREATE_LYRIC_TYPE_ENUM = `
    CREATE TYPE lyric_type as ENUM (
        'LYRIC_TYPE_VERSE',
        'LYRIC_TYPE_PRECHORUS',
        'LYRIC_TYPE_CHORUS',
        'LYRIC_TYPE_BRIDGE'
    );
`.trim();

/* export */ const QUERY_CREATE_LYRICS_TABLE = `
    CREATE TABLE IF NOT EXISTS lyrics (
        song_id uuid NOT NULL,
        lyric_type lyric_type NOT NULL,
        verse_number integer NOT NULL,
        presentation_order integer NOT NULL,
        lyrics text NOT NULL,
        inserted_dt timestamptz NOT NULL,
        updated_dt timestamptz NOT NULL,
        PRIMARY KEY (song_id, lyric_type, verse_number)
    );
`.trim();
