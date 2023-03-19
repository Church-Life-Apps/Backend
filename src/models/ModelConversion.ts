import {DbLyric, DbPendingSong, DbSong} from '../db/DbModels';
import {formatForDbSearchColumn} from '../utils/StringUtils';
import {Lyric, PendingSong, Song, SongWithMatchedText} from './ApiModels';

/**
 * Data model conversion helpers.
 *
 * Data types that have the same fields don't need an explicit function,
 * they can just be used interchangeably by typescript.
 */

export function toDbLyric(lyric: Lyric): DbLyric {
  return {
    songId: lyric.songId,
    lyricType: lyric.lyricType,
    verseNumber: lyric.verseNumber,
    lyrics: lyric.lyrics,
    searchLyrics: formatForDbSearchColumn(lyric.lyrics),
  };
}

export function toDbPendingSong(pendingSong: PendingSong): DbPendingSong {
  return {
    id: pendingSong.id,
    songbookId: pendingSong.songbookId,
    number: pendingSong.number,
    title: pendingSong.title,
    author: pendingSong.author,
    music: pendingSong.music,
    presentationOrder: pendingSong.presentationOrder,
    imageUrl: pendingSong.imageUrl,
    audioUrl: pendingSong.audioUrl,
    lyrics: pendingSong.lyrics.map((lyric) => toDbLyric(lyric)),
    requesterName: pendingSong.requesterName,
    requesterEmail: pendingSong.requesterEmail,
    requesterNote: pendingSong.requesterNote,
  };
}

export function toSongWithMatchedText(
  song: DbSong | Song,
  matchText: string
): SongWithMatchedText {
  return {
    song: song,
    matchText: matchText,
  };
}
