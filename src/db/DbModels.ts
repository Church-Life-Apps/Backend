/**
 * Data Models for inserting and retrieving rows from the database
 */

import {v4 as uuidv4} from 'uuid';

// Data object for Songbooks table
export interface DbSongbook {
  id: string;
  fullName: string;
  staticMetadataLink: string;
  imageUrl: string;
}

// Data object for Songs table
export interface DbSong {
  id: typeof uuidv4;
  songbookId: string;
  number: number;
  title: string;
  author: string;
  music: string;
  presentationOrder: string;
  imageUrl: string;
}

// Db Lyric Type Enum
export enum LyricType {
  LYRIC_TYPE_VERSE,
  LYRIC_TYPE_PRECHORUS,
  LYRIC_TYPE_CHORUS,
  LYRIC_TYPE_BRIDGE,
}

// Data object for Lyrics table
export interface DbLyric {
  songId: typeof uuidv4;
  lyricType: LyricType;
  verseNumber: number;
  lyrics: string;
}

// Data object for joined Songs table with Lyrics table
export interface DbSongWithLyrics {
  song: DbSong;
  lyrics: DbLyric[];
}

/**
 * Converts an object to a DbSongbook object.
 */
export function toDbSongbook(data: any): DbSongbook {
  return {
    id: data.id ?? '',
    fullName: data.fullName ?? '',
    staticMetadataLink: data.staticMetadataLink ?? '',
    imageUrl: data.imageUrl ?? '',
  };
}
