import "dotenv/config";
import express from "express";
import cors from "cors";
import * as path from "path";
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
app.use(express.static(path.resolve(__dirname, "../web-build")));

const PORT = process.env.PORT || 3000;

const songsService = new SongsService();

app.get("/hi", (req, res) => {
  res.send("hello");
});

// List Songbooks API
app.get("/api/songbooks", async (_req, res) => {
  try {
    res.send(await songsService.getSongbooks());
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// List Songs API
app.get("/api/songs", async (req, res) => {
  try {
    const songbookId = (req.query.songbookId as string) ?? "";
    validateGetSongsRequest(songbookId);
    res.send(await songsService.getSongsMethod(songbookId));
  } catch (e: any) {
    handleErrorsAndReturn(e, res);
  }
});

// Get Song [With Lyrics] API
app.get("/api/song", async (req, res) => {
  try {
    const songbookId = (req.query.songbookId as string) ?? "";
    const number = (req.query.number as string) ?? "";
    validateGetSongRequest(songbookId, number);
    res.send(
      await songsService.getSongWithLyricsMethod(
        songbookId,
        parseInt(number, 10)
      )
    );
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
  // TODO: Write search API which takes in a search string, and maybe other filters, and returns a list of songs which matches.
});

app.get("*", (_request, response) => {
  response.sendFile(path.resolve(__dirname, "../web-build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
