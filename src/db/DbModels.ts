/**
 * Data Models for inserting and retrieving rows from the database
 */

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
