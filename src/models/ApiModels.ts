/**
 * Data Models for API Request and Response objects.
 */

/**
 * Data object for Songbooks APIs
 */
export interface Songbook {
  id: string;
  fullName: string;
  staticMetadataLink: string;
  imageUrl: string;
  openToNewSongs: boolean;
}

/**
 * HTTP request body model for Songbook creation
 */
export interface CreateSongbookRequest {
  fullName: string;
  staticMetadataLink: string;
  imageUrl: string;
  openToNewSongs: boolean;
}

/**
 *   Data object for Songs APIs
 */
export interface Song {
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

/**
 * HTTP Request body for creating a Song
 */
export interface CreateSongRequest {
  title: string;
  author: string;
  music: string;
  lyrics: Lyric[];
  presentationOrder: string;
  imageUrl: string;
  audioUrl: string;
}

// Lyric Type Enum
export enum LyricType {
  LYRIC_TYPE_VERSE = "LYRIC_TYPE_VERSE",
  LYRIC_TYPE_PRECHORUS = "LYRIC_TYPE_PRECHORUS",
  LYRIC_TYPE_CHORUS = "LYRIC_TYPE_CHORUS",
  LYRIC_TYPE_BRIDGE = "LYRIC_TYPE_BRIDGE",
}

// Data object for Lyrics APIs
export interface Lyric {
  songId: string; // uuid
  lyricType: LyricType;
  verseNumber: number;
  lyrics: string;
}

// Data object for joined Songs and Lyrics APIs
export interface SongWithLyrics extends Song {
  lyrics: Lyric[];
}

// Data object for Pending Song APIs
export interface PendingSong {
  id: string; // uuid
  songbookId: string;
  number: number;
  title: string;
  author: string;
  music: string;
  presentationOrder: string;
  imageUrl: string;
  audioUrl: string;
  lyrics: Lyric[];
  requesterName: string;
  requesterEmail: string;
  requesterNote: string;
}

/**
 * Converts an object to a Songbook object.
 */
export function toSongbook(data: any): Songbook {
  return {
    id: data.id ?? "",
    fullName: data.fullName ?? "",
    staticMetadataLink: data.staticMetadataLink ?? "",
    imageUrl: data.imageUrl ?? "",
    openToNewSongs: data.openToNewSongs ?? false,
  };
}

/**
 * Converts an object to a Song object.
 */
export function toSong(data: any): Song {
  return {
    id: data.id ?? "",
    songbookId: data.songbookId ?? "",
    number: data.number ?? 0,
    title: data.title ?? "",
    author: data.author ?? "",
    music: data.music ?? "",
    presentationOrder: data.presentationOrder ?? "",
    imageUrl: data.imageUrl ?? "",
    audioUrl: data.audioUrl ?? "",
  };
}

/**
 * Converts an object to a Lyric object.
 */
export function toLyric(data: any): Lyric {
  return {
    songId: data.songId ?? "",
    lyricType: data.lyricType ?? "",
    verseNumber: data.verseNumber ?? 0,
    lyrics: data.lyrics ?? "",
  };
}

/**
 * Converts an object to a PendingSong object.
 */
export function toPendingSong(data: any): PendingSong {
  const lyrics: Lyric[] = data.lyrics.map((lyricJson: any) =>
    toLyric(lyricJson)
  );
  return {
    id: data.id ?? "",
    songbookId: data.songbookId ?? "",
    number: data.number ?? 0,
    title: data.title ?? "",
    author: data.author ?? "",
    music: data.music ?? "",
    presentationOrder: data.presentationOrder ?? "",
    imageUrl: data.imageUrl ?? "",
    audioUrl: data.audioUrl ?? "",
    lyrics,
    requesterName: data.requesterName,
    requesterEmail: data.requesterEmail,
    requesterNote: data.requesterNote,
  };
}

/**
 * Converts a PendingSong to a Song object.
 */
export function pendingSongToSong(pendingSong: PendingSong): Song {
  return {
    id: pendingSong.id ?? "",
    songbookId: pendingSong.songbookId ?? "",
    number: pendingSong.number ?? 0,
    title: pendingSong.title ?? "",
    author: pendingSong.author ?? "",
    music: pendingSong.music ?? "",
    presentationOrder: pendingSong.presentationOrder ?? "",
    imageUrl: pendingSong.imageUrl ?? "",
    audioUrl: pendingSong.audioUrl ?? "",
  };
}

export interface RejectPendingSongRequest {
  pendingSong: PendingSong;
  rejectionReason: string;
}

export function toRejectPendingSongRequest(
  data: any
): RejectPendingSongRequest {
  return {
    pendingSong: toPendingSong(data.pendingSong),
    rejectionReason: data.rejectionReason ?? "",
  };
}

export interface AcceptPendingSongRequest {
  pendingSong: PendingSong;
  acceptanceNote: string;
}

export function toAcceptPendingSongRequest(
  data: any
): AcceptPendingSongRequest {
  return {
    pendingSong: toPendingSong(data.pendingSong),
    acceptanceNote: data.acceptanceNote ?? "",
  };
}

export interface SearchRequest {
  searchText: string; // Search text filter (must not be empty)
  songbook: string; // Optional songbook filter
}

export function toSearchRequest(data: any): SearchRequest {
  return {
    searchText: data.searchText ?? "",
    songbook: data.songbook ?? "",
  };
}

export interface SearchResponse {
  matchedSongs: Song[];
}
