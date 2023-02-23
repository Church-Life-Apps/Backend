import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import {toDbLyric, toDbSong, toDbSongbook} from './db/DbModels';
import {
  validateGetSongRequest,
  validateGetSongsRequest,
  validateInsertLyricRequest,
  validateInsertSongbookRequest,
  validateInsertSongRequest,
} from './helpers/RequestValidationHelpers';
import {SongsService} from './services/SongsService';
import {Response} from 'express-serve-static-core';
import {DatabaseError, ValidationError} from './helpers/ErrorHelpers';

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
app.get('/songbooks', async (_req, res) => {
  try {
    res.send(await songsService.getSongbooks());
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// List Songs API
app.get('/songs', async (req, res) => {
  try {
    const songbookId = (req.query.songbookId as string) ?? '';
    validateGetSongsRequest(songbookId);
    res.send(await songsService.getSongsMethod(songbookId));
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// Get Song [With Lyrics] API
app.get('/song', async (req, res) => {
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

// Create Songbook API
app.post('/createsongbook', async (req, res) => {
  try {
    console.log(`Create Songbook API Request received: ${req.url}`);
    const dbSongbook = toDbSongbook(req.body);
    validateInsertSongbookRequest(dbSongbook);
    const val = await songsService.insertSongbookMethod(dbSongbook);
    console.log(`Returning ${val}`);
    res.send(val ?? {});
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// Create Song API
app.post('/createsong', async (req, res) => {
  try {
    console.log(`Create Song API Request received: ${req.url}`);
    const dbSong = toDbSong(req.body);
    validateInsertSongRequest(dbSong);
    const val = await songsService.insertSongMethod(dbSong);
    console.log(`Returning ${val}`);
    res.send(val ?? {});
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// Create Lyric API
app.post('/createlyric', async (req, res) => {
  try {
    console.log(`Create Lyric API Request received: ${req.url}`);
    const dbLyric = toDbLyric(req.body);
    validateInsertLyricRequest(dbLyric);
    const val = await songsService.insertLyricMethod(dbLyric);
    console.log(`Returning ${val}`);
    res.send(val ?? {});
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

app.get('*', function (request, response) {
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
