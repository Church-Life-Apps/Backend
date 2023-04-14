import {DbLyric, DbPendingSong} from '../db/DbModels';
import {Lyric, PendingSong} from './ApiModels';

/**
 * Data model conversion helpers.
 *
 * Data types that have the same fields don't need an explicit function,
 * they can just be used interchangeably by typescript.
 */

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
    lyrics: pendingSong.lyrics,
    requesterName: pendingSong.requesterName,
    requesterEmail: pendingSong.requesterEmail,
    requesterNote: pendingSong.requesterNote,
  };
}
