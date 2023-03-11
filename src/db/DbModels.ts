/**
 * Data Models for inserting and retrieving rows from the database
 */

import {json} from 'stream/consumers';

// Data object for Songbooks table
export interface DbSongbook {
  id: string;
  fullName: string;
  staticMetadataLink: string;
  imageUrl: string;
  openToNewSongs: boolean;
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
  audioUrl: string;
}

// Db Lyric Type Enum
export enum LyricType {
  LYRIC_TYPE_VERSE = 'LYRIC_TYPE_VERSE',
  LYRIC_TYPE_PRECHORUS = 'LYRIC_TYPE_PRECHORUS',
  LYRIC_TYPE_CHORUS = 'LYRIC_TYPE_CHORUS',
  LYRIC_TYPE_BRIDGE = 'LYRIC_TYPE_BRIDGE',
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

// Data object for pending_songs table
export interface DbPendingSong {
  id: string; // uuid
  songbookId: string;
  number: number;
  title: string;
  author: string;
  music: string;
  presentationOrder: string;
  imageUrl: string;
  audioUrl: string;
  lyrics: DbLyric[];
  requesterName: string;
  requesterEmail: string;
  requesterNote: string;
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
    openToNewSongs: data.openToNewSongs ?? false,
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
    audioUrl: data.audioUrl ?? '',
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

/**
 * Converts an object to a DbPendingSong object.
 */
export function toDbPendingSong(data: any): DbPendingSong {
  const lyrics: DbLyric[] = data.lyrics.map((lyricJson: any) => {
    return toDbLyric(lyricJson);
  });
  return {
    id: data.id ?? '',
    songbookId: data.songbookId ?? '',
    number: data.number ?? 0,
    title: data.title ?? '',
    author: data.author ?? '',
    music: data.music ?? '',
    presentationOrder: data.presentationOrder ?? '',
    imageUrl: data.imageUrl ?? '',
    audioUrl: data.audioUrl ?? '',
    lyrics: lyrics,
    requesterName: data.requesterName,
    requesterEmail: data.requesterEmail,
    requesterNote: data.requesterNote,
  };
}

/**
 * Converts a DbPendingSong to a DbSong object.
 */
export function pendingSongToSong(pendingSong: DbPendingSong): DbSong {
  return {
    id: pendingSong.id ?? '',
    songbookId: pendingSong.songbookId ?? '',
    number: pendingSong.number ?? 0,
    title: pendingSong.title ?? '',
    author: pendingSong.author ?? '',
    music: pendingSong.music ?? '',
    presentationOrder: pendingSong.presentationOrder ?? '',
    imageUrl: pendingSong.imageUrl ?? '',
    audioUrl: pendingSong.audioUrl ?? '',
  };
}
