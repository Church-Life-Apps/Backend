/**
 * Data Models for inserting and retrieving rows from the database
 */

import {v4 as uuidv4} from 'uuid';

// Data object for Songbooks table
interface DbSongbook {
  id: string;
  fullName: string;
  staticMetadataLink: String;
}

// Data object for Songs table
interface DbSong {
  id: typeof uuidv4;
  songbookId: string;
  number: number;
  title: string;
  author: string;
  music: string;
  presentationOrder: string;
  imageUrl: String;
}

// Db Lyric Type Enum
enum LyricType {
  LYRIC_TYPE_VERSE,
  LYRIC_TYPE_PRECHORUS,
  LYRIC_TYPE_CHORUS,
  LYRIC_TYPE_BRIDGE,
}

// Data object for Lyrics table
interface DbLyric {
  songId: typeof uuidv4;
  lyricType: LyricType;
  verseNumber: number;
  lyrics: string;
}

// Data object for joined Songs table with Lyrics table
interface DbSongWithLyrics {
  song: DbSong;
  lyrics: DbLyric[];
}
