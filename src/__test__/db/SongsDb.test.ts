import {Pool} from 'pg';
import {
  DbLyric,
  DbPendingSong,
  DbSong,
  DbSongbook,
  DbSongWithLyrics,
  LyricType,
} from '../../db/DbModels';
import {
  QUERY_CREATE_LYRICS_TABLE,
  QUERY_CREATE_LYRIC_TYPE_ENUM,
  QUERY_CREATE_PENDING_SONGS_TABLE,
  QUERY_CREATE_SONGBOOKS_TABLE,
  QUERY_CREATE_SONGS_TABLE,
} from '../../db/DbQueries';
import {SongsDb} from '../../db/SongsDb';
import {v4 as uuidv4} from 'uuid';
import {formatForDbSearchColumn} from '../../utils/StringUtils';

require('dotenv').config();

// Setup
const testPool = new Pool({
  host: process.env.TEST_PG_HOST,
  port: (process.env.TEST_PG_PORT || 25060) as number,
  user: process.env.TEST_PG_USER,
  password: process.env.TEST_PG_PASSWORD,
  database: process.env.TEST_PG_DATABASE,
  ssl: {
    ca: process.env.DB_CERT,
  },
});

const songsDb = new SongsDb(testPool);

async function nukeDatabase() {
  await testPool.query('DROP TABLE IF EXISTS songbooks CASCADE');
  await testPool.query('DROP TABLE IF EXISTS songs CASCADE');
  await testPool.query('DROP TABLE IF EXISTS pending_songs CASCADE');
  await testPool.query('DROP TABLE IF EXISTS lyrics CASCADE');
  await testPool.query('DROP TYPE IF EXISTS lyric_type');
}

async function initializeDatabase() {
  await nukeDatabase();

  await testPool.query(QUERY_CREATE_SONGBOOKS_TABLE);
  await testPool.query(QUERY_CREATE_SONGS_TABLE);
  await testPool.query(QUERY_CREATE_LYRIC_TYPE_ENUM);
  await testPool.query(QUERY_CREATE_LYRICS_TABLE);
  await testPool.query(QUERY_CREATE_PENDING_SONGS_TABLE);
}

async function resetDatabase() {
  await testPool.query('DELETE FROM lyrics');
  await testPool.query('DELETE FROM songs');
  await testPool.query('DELETE FROM pending_songs');
  await testPool.query('DELETE FROM songbooks');
}

const songbookId = 'shl';
const songbookName = 'Songs and Hymns of Life';
const smLink = 's_m_link';
const songbookImageUrl = 'songbook_image_url';
const openToNewSongs = true;
const songId = uuidv4();
const number = 50;
const title = 'Song Title';
const author = 'Song Author';
const music = 'Song Music';
const presentationOrder = 'v1 c1 v2 c1 v3 c1 v4 c2';
const songImageUrl = 'song_image_url';
const songAudioUrl = 'song_audio_url';
const verse1 = 'Some lyrics for the first verse';
const verse2 = 'More lyrics for the second verse';
const chorus = 'Final lyrics for the chorus';
const requesterName = 'requester name';
const requesterEmail = 'requester email';
const requesterNote = 'requester note';

const testSongbook: DbSongbook = {
  id: songbookId,
  fullName: songbookName,
  staticMetadataLink: smLink,
  imageUrl: songbookImageUrl,
  openToNewSongs: openToNewSongs,
};

const testSong: DbSong = {
  id: songId,
  songbookId: songbookId,
  number: number,
  title: title,
  author: author,
  music: music,
  presentationOrder: presentationOrder,
  imageUrl: songImageUrl,
  audioUrl: songAudioUrl,
};

const testSongUpdated = {
  ...testSong,
  title: 'new title',
  author: 'new author',
  music: 'new music',
  presentationOrder: 'v1 v1 v1 v1 v1',
  imageUrl: 'new song image url',
  audioUrl: 'new song audio url',
};

const testLyrics: DbLyric[] = [
  {
    songId: songId,
    lyricType: LyricType.LYRIC_TYPE_VERSE,
    verseNumber: 1,
    lyrics: verse1,
    searchLyrics: formatForDbSearchColumn(verse1),
  },
  {
    songId: songId,
    lyricType: LyricType.LYRIC_TYPE_VERSE,
    verseNumber: 2,
    lyrics: verse2,
    searchLyrics: formatForDbSearchColumn(verse2),
  },
  {
    songId: songId,
    lyricType: LyricType.LYRIC_TYPE_CHORUS,
    verseNumber: 1,
    lyrics: chorus,
    searchLyrics: formatForDbSearchColumn(chorus),
  },
];

const testSongWithLyrics: DbSongWithLyrics = {
  song: testSong,
  lyrics: testLyrics,
};

const testPendingSong: DbPendingSong = {
  id: songId,
  songbookId: songbookId,
  number: number,
  title: title,
  author: author,
  music: music,
  presentationOrder: presentationOrder,
  imageUrl: songImageUrl,
  audioUrl: songAudioUrl,
  lyrics: testLyrics,
  requesterName: requesterName,
  requesterEmail: requesterEmail,
  requesterNote: requesterNote,
};

const testPendingSongUpdated: DbPendingSong = {
  ...testPendingSong,
  id: uuidv4(),
  number: number + 1,
};

describe('Test Database Tables', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  beforeEach(async () => {
    console.log('Resetting Database');
    await resetDatabase();
  });

  afterAll(async () => {
    await nukeDatabase();
  });

  test('Insert and Get Songbook Function', async () => {
    const inserted = await songsDb.insertSongbook(testSongbook);
    assertJsonEquality(inserted, testSongbook);

    const queried = await songsDb.querySongbooks();
    assertJsonEquality(queried, [testSongbook]);

    assertFails(
      () => songsDb.insertSongbook(testSongbook),
      'Insert songbook should fail on duplicate id.'
    );
  });

  test(`Insert and Get Song Functions`, async () => {
    await songsDb.insertSongbook(testSongbook);
    const inserted = await songsDb.upsertSong(testSong);
    assertJsonEquality(inserted, testSong);

    const queried = await songsDb.querySongsForSongbook(songbookId);
    assertJsonEquality(queried, [testSong]);

    const empty = await songsDb.querySongsForSongbook('no songbook id');
    expect(empty.length).toBe(0);

    const updated = await songsDb.upsertSong(testSongUpdated);
    assertJsonEquality(updated, testSongUpdated);

    const queriedUpdated = await songsDb.querySongsForSongbook(songbookId);
    assertJsonEquality(queriedUpdated, [testSongUpdated]);
  });

  test(`Insert Lyrics and Get Lyric Functions`, async () => {
    await songsDb.insertSongbook(testSongbook);
    await songsDb.upsertSong(testSong);
    const inserted1 = await songsDb.upsertLyric(testLyrics[0]);
    const inserted2 = await songsDb.upsertLyric(testLyrics[1]);
    const inserted3 = await songsDb.upsertLyric(testLyrics[2]);
    assertJsonEquality([inserted1, inserted2, inserted3], testLyrics);

    const queriedSongWithLyrics = await songsDb.querySongWithLyrics(
      songbookId,
      number
    );
    assertJsonEquality(queriedSongWithLyrics, testSongWithLyrics);

    const newLyric: DbLyric = {
      ...testLyrics[0],
      lyrics: 'new "lyric" for update\'s',
    };
    const updated = await songsDb.upsertLyric(newLyric);
    assertJsonEquality(updated, newLyric);

    await assertFails(
      () => songsDb.upsertLyric({...testLyrics[0], songId: uuidv4()}),
      'Insert lyric should fail due to no song id'
    );
  });

  test(`Insert Pending Song and Get Pending Songs Functions`, async () => {
    await songsDb.insertSongbook(testSongbook);
    const inserted = await songsDb.insertPendingSong(testPendingSong);
    assertJsonEquality(inserted, testPendingSong);

    const queried = await songsDb.queryPendingSongs();
    assertJsonEquality(queried, [testPendingSong]);

    const inserted2 = await songsDb.insertPendingSong(testPendingSongUpdated);
    assertJsonEquality(inserted2, testPendingSongUpdated);

    const queried2 = await songsDb.queryPendingSongs();
    assertJsonEquality(queried2, [testPendingSong, testPendingSongUpdated]);
  });

  test(`Reject Pending Song Function`, async () => {
    await songsDb.insertSongbook(testSongbook);
    await songsDb.insertPendingSong(testPendingSong);
    const deleted = await songsDb.deletePendingSong(testPendingSong.id);

    assertJsonEquality(deleted, testPendingSong);

    const queried = await songsDb.queryPendingSongs();
    assertJsonEquality(queried, []);

    const nullSong = await songsDb.deletePendingSong(uuidv4());
    expect(nullSong).toBe(null);
  });

  test(`Accept Pending Song Function`, async () => {
    await songsDb.insertSongbook(testSongbook);
    await assertFails(
      () => songsDb.acceptPendingSong(testPendingSong),
      'Accept pending song should fail when there is no pending song present.'
    );
    await assertFails(
      () => songsDb.querySongWithLyrics(songbookId, number),
      'Should have no song still'
    );
    const inserted = await songsDb.insertPendingSong(testPendingSong);
    assertJsonEquality(inserted, testPendingSong);

    await songsDb.acceptPendingSong(testPendingSong);
    await assertFails(
      () => songsDb.getPendingSongById(testPendingSong.id),
      'Pending song should have been deleted'
    );

    const createdSong = await songsDb.querySongWithLyrics(songbookId, number);
    assertJsonEquality(createdSong, testSongWithLyrics);

    const newTitle = 'new title';
    const updatedPendingSong: DbPendingSong = {
      ...testPendingSong,
      id: uuidv4(),
      title: newTitle,
      lyrics: testLyrics.slice(0, 2),
    };

    const updatedInserted = await songsDb.insertPendingSong(updatedPendingSong);
    assertJsonEquality(updatedInserted, updatedPendingSong);

    await songsDb.acceptPendingSong(updatedPendingSong);

    const expectedUpdated: DbSongWithLyrics = {
      song: {
        ...testSong,
        title: newTitle,
      },
      lyrics: testLyrics.slice(0, 2),
    };
    const updatedSong = await songsDb.querySongWithLyrics(songbookId, number);
    assertJsonEquality(updatedSong, expectedUpdated);

    const remainingPendingSongs = await songsDb.queryPendingSongs();
    assertJsonEquality(remainingPendingSongs, []);
  });
});

async function assertFails(func: () => Promise<any>, message: string) {
  try {
    await func();
  } catch (e: any) {
    return;
  }
  fail(`Manually failing due to: ${message}`);
}

function assertJsonEquality(one: any, two: any) {
  expect(JSON.stringify(one)).toBe(JSON.stringify(two));
}

function fail(message: string) {
  throw new Error(message);
}
