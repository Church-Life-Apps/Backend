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
  id: string; // uuid
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
  LYRIC_TYPE_VERSE = "LYRIC_TYPE_VERSE",
  LYRIC_TYPE_PRECHORUS = "LYRIC_TYPE_PRECHORUS",
  LYRIC_TYPE_CHORUS = "LYRIC_TYPE_CHORUS",
  LYRIC_TYPE_BRIDGE = "LYRIC_TYPE_BRIDGE",
}

// Data object for Lyrics table
export interface DbLyric {
  songId: string; // uuid
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

/**
 * Converts an object to a DbSongbook object.
 */
export function toDbSong(data: any): DbSong {
  return {
    id: data.id ?? '',
    songbookId: data.songbookId ?? '',
    number: data.number ?? 0,
    title: data.title ?? '',
    author: data.author ?? '',
    music: data.music ?? '',
    presentationOrder: data.presentationOrder ?? '',
    imageUrl: data.imageUrl ?? '',
  };
}

/**
 * Converts an object to a DbLyric object.
 */
export function toDbLyric(data: any): DbLyric {
  return {
    songId: data.songId ?? '',
    lyricType: data.lyricType ?? '',
    verseNumber: data.verseNumber ?? 0,
    lyrics: data.lyrics ?? '',
  };
}
