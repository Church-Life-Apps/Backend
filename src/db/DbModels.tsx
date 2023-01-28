/**
 * Data Models for inserting and retrieving rows from the database
 */

import {v4 as uuidv4} from 'uuid';

// Data object for Songbooks table
interface DbSongbook {
    id: string,
    fullName: string,
    staticMetadataLink: String
};

// Data object for Songs table
interface DbSong {
    id: typeof uuidv4,
    songbookId: string,
    number: number,
    title: string,
    author: string,
    music: string,
    imageUrl: String
}

// Db Verse Type Enum
enum VerseType {
    VERSE_TYPE_VERSE, 
    VERSE_TYPE_PRECHORUS,
    VERSE_TYPE_CHORUS, 
    VERSE_TYPE_BRIDGE
}

// Data object for Lyrics table
interface DbLyric {
    songId: typeof uuidv4,
    verseType: VerseType,
    verseNumber: number,
    presentationOrder: number,
    lyrics: string
}

// Data object for joined Songs table with Lyrics table
interface DbSongWithLyrics {
    song: DbSong,
    lyrics: DbLyric[];
}
