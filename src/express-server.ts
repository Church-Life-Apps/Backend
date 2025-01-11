import "dotenv/config";
import express from "express";
import cors from "cors";
import { Response } from "express-serve-static-core";
import {
  validateAcceptPendingSongRequest,
  validateGetSongRequest,
  validateGetSongsRequest,
  validateInsertLyricRequest,
  validateInsertPendingSongRequest,
  validateInsertSongbookRequest,
  validateInsertSongRequest,
  validateRejectPendingSongRequest,
  validateSearchRequest,
} from "./helpers/RequestValidationHelpers";
import SongsService from "./services/SongsService";
import { DatabaseError, ValidationError } from "./helpers/ErrorHelpers";

import {
  SearchResponse,
  toAcceptPendingSongRequest,
  toLyric,
  toPendingSong,
  toRejectPendingSongRequest,
  toSearchRequest,
  toSong,
  toSongbook,
} from "./models/ApiModels";

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

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const songsService = new SongsService();

// List Songbooks API
app.get("/api/songbooks", async (_req, res) => {
  try {
    res.send(await songsService.getSongbooks());
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// List Songs API
app.get("/api/songs/:songbookId", async (req, res) => {
  try {
    const songbookId = (req.params.songbookId as string) ?? "";
    validateGetSongsRequest(songbookId);
    res.status(200).send(await songsService.getSongsMethod(songbookId));
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// Get Song [With Lyrics] API
app.get("/api/songs/:songbookId/:songNumber", async (req, res) => {
  try {
    const songbookId = req.params.songbookId ?? "";
    const number = parseInt(req.params.songNumber ?? "", 10);
    res.send(await songsService.getSongWithLyrics(songbookId, number));
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// List Pending Songs API
app.get("/api/pendingsongs", async (_req, res) => {
  try {
    res.send(await songsService.getPendingSongs());
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// Create Songbook API
// TODO: Make this a "protected"/internal API
app.post("/api/songbook", async (req, res) => {
  try {
    console.log(`Create Songbook API Request received: ${req.url}`);
    const songbook = toSongbook(req.body);
    validateInsertSongbookRequest(songbook);
    const val = await songsService.insertSongbookMethod(songbook);
    console.log(`Returning ${JSON.stringify(val)}`);
    res.send(val ?? {});
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// Create Song API
// TODO: Make this a "protected"/internal API
app.post("/api/song", async (req, res) => {
  try {
    console.log(`Create Song API Request received: ${req.url}`);
    const song = toSong(req.body);
    validateInsertSongRequest(song);
    const val = await songsService.upsertSongMethod(song);
    console.log(`Returning ${JSON.stringify(val)}`);
    res.send(val ?? {});
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// Create Lyric API
// TODO: Make this a "protected"/internal API
app.post("/api/lyric", async (req, res) => {
  try {
    console.log(`Create Lyric API Request received: ${req.url}`);
    const lyric = toLyric(req.body);
    validateInsertLyricRequest(lyric);
    const val = await songsService.insertLyricMethod(lyric);
    console.log(`Returning ${JSON.stringify(val)}`);
    res.send(val ?? {});
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// Create Pending Song API
app.post("/api/pendingsong", async (req, res) => {
  try {
    console.log(`Create Pending Song API Request received: ${req.url}`);
    const pendingSong = toPendingSong(req.body);
    validateInsertPendingSongRequest(pendingSong);
    const val = await songsService.insertPendingSongMethod(pendingSong);
    console.log(`Returning ${JSON.stringify(val)}`);
    res.send(val ?? {});
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// TODO: Make this a "protected"/internal API
app.post("/api/rejectpendingsong", async (req, res) => {
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
app.post("/api/acceptpendingsong", async (req, res) => {
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

app.get("/api/search", async (req, res) => {
  try {
    console.debug(`Search API Request received: ${req.url}`);
    const request = toSearchRequest(req.query);
    validateSearchRequest(request);
    const matchedSongs = await songsService.searchSongs(
      request.searchText,
      request.songbook
    );
    const response: SearchResponse = {
      matchedSongs,
    };
    console.log(
      `Returning ${matchedSongs.length} songs with search string: "${request.searchText}" and songbook: "${request.songbook}"`
    );
    res.send(response ?? {});
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
