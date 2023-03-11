import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import {
  toDbLyric,
  toDbSong,
  toDbSongbook,
  toDbPendingSong,
} from './db/DbModels';
import {
  validateAcceptPendingSongRequest,
  validateGetSongRequest,
  validateGetSongsRequest,
  validateInsertLyricRequest,
  validateInsertPendingSongRequest,
  validateInsertSongbookRequest,
  validateInsertSongRequest,
  validateRejectPendingSongRequest,
} from './helpers/RequestValidationHelpers';
import {SongsService} from './services/SongsService';
import {Response} from 'express-serve-static-core';
import {DatabaseError, ValidationError} from './helpers/ErrorHelpers';
import {
  toAcceptPendingSongRequest,
  toRejectPendingSongRequest,
} from './helpers/ApiHelpers';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../web-build')));

const PORT = process.env.PORT || 3000;

const songsService = new SongsService();

app.get('/hi', (req, res) => {
  res.send('hello');
});

// List Songbooks API
app.get('/api/songbooks', async (_req, res) => {
  try {
    res.send(await songsService.getSongbooks());
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// List Songs API
app.get('/api/songs', async (req, res) => {
  try {
    const songbookId = (req.query.songbookId as string) ?? '';
    validateGetSongsRequest(songbookId);
    res.send(await songsService.getSongsMethod(songbookId));
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// Get Song [With Lyrics] API
app.get('/api/song', async (req, res) => {
  try {
    const songbookId = (req.query.songbookId as string) ?? '';
    const number = (req.query.number as string) ?? '';
    validateGetSongRequest(songbookId, number);
    res.send(
      await songsService.getSongWithLyricsMethod(songbookId, parseInt(number))
    );
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// List Pending Songs API
app.get('/api/pendingsongs', async (_req, res) => {
  try {
    res.send(await songsService.getPendingSongs());
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// Create Songbook API
// TODO: Make this a "protected"/internal API
app.post('/api/songbook', async (req, res) => {
  try {
    console.log(`Create Songbook API Request received: ${req.url}`);
    const dbSongbook = toDbSongbook(req.body);
    validateInsertSongbookRequest(dbSongbook);
    const val = await songsService.insertSongbookMethod(dbSongbook);
    console.log(`Returning ${JSON.stringify(val)}`);
    res.send(val ?? {});
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// Create Song API
// TODO: Make this a "protected"/internal API
app.post('/api/song', async (req, res) => {
  try {
    console.log(`Create Song API Request received: ${req.url}`);
    const dbSong = toDbSong(req.body);
    validateInsertSongRequest(dbSong);
    const val = await songsService.upsertSongMethod(dbSong);
    console.log(`Returning ${JSON.stringify(val)}`);
    res.send(val ?? {});
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// Create Lyric API
// TODO: Make this a "protected"/internal API
app.post('/api/lyric', async (req, res) => {
  try {
    console.log(`Create Lyric API Request received: ${req.url}`);
    const dbLyric = toDbLyric(req.body);
    validateInsertLyricRequest(dbLyric);
    const val = await songsService.insertLyricMethod(dbLyric);
    console.log(`Returning ${JSON.stringify(val)}`);
    res.send(val ?? {});
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// Create Pending Song API
app.post('/api/pendingsong', async (req, res) => {
  try {
    console.log(`Create Pending Song API Request received: ${req.url}`);
    const pendingSong = toDbPendingSong(req.body);
    validateInsertPendingSongRequest(pendingSong);
    const val = await songsService.insertPendingSongMethod(pendingSong);
    console.log(`Returning ${JSON.stringify(val)}`);
    res.send(val ?? {});
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// TODO: Make this a "protected"/internal API
app.post('/api/rejectpendingsong', async (req, res) => {
  try {
    console.log(`Reject Pending Song API Request received: ${req.url}`);
    const request = toRejectPendingSongRequest(req.body);
    validateRejectPendingSongRequest(request);
    const success = await songsService.rejectPendingSongMethod(
      request.pendingSong,
      request.rejectionReason
    );
    res.send(`{"success": "${success}"`);
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// TODO: Make this a "protected"/internal API
app.post('/api/acceptpendingsong', async (req, res) => {
  try {
    console.log(`Accept Pending Song API Request received: ${req.url}`);
    const request = toAcceptPendingSongRequest(req.body);
    validateAcceptPendingSongRequest(request);
    const success = await songsService.acceptPendingSongMethod(
      request.pendingSong,
      request.acceptanceNote
    );
    res.send(`{"success": "${success}"`);
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

app.get('*', function (_request, response) {
  response.sendFile(path.resolve(__dirname, '../web-build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

/**
 * Handles API errors
 */
function handleErrorsAndReturn(
  e: Error,
  res: Response<any, Record<string, any>, number>
) {
  console.error(e);
  if (e instanceof TypeError) {
    res.status(400).send(`Error: Bad Request: ${e.message}`);
  } else if (e instanceof ValidationError) {
    res.status(400).send(`Validation Error: ${e.message}`);
  } else if (e instanceof DatabaseError) {
    res.status(400).send(`Db Error: ${e.message}`);
  } else {
    res.status(400).send(`Error: Bad Request: ${e.message}`);
  }
}
