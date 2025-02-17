import { APIGatewayEvent } from "aws-lambda";
import { randomUUID } from "crypto";
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
  CreateSongRequest,
  Lyric,
  SearchRequest,
  SearchResponse,
  Songbook,
  SongWithLyrics,
  toAcceptPendingSongRequest,
  toPendingSong,
  toRejectPendingSongRequest,
  toSong,
  toSongbook,
} from "./models/ApiModels";
import NotFoundError from "./errors/NotFoundError";

const makeHeaders = () => ({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
});

/**
 * Handles API errors
 */
function formatErrorResponse(e: unknown) {
  console.error(e);
  const formatBody = (message: string | undefined) =>
    message ? `{ "message": ${message} }` : undefined;
  let statusCode = 500;
  let message: string | undefined;

  if (e instanceof TypeError) {
    statusCode = 400;
    message = `Type Error: ${e.message}`;
  } else if (e instanceof ValidationError) {
    statusCode = 400;
    message = `Validation Error: ${e.message}`;
  } else if (e instanceof DatabaseError) {
    statusCode = 500;
    message = `Db Error: ${e.message}`;
  } else if (e instanceof NotFoundError) {
    statusCode = 404;
  } else {
    statusCode = 500;
  }

  return {
    statusCode,
    headers: makeHeaders(),
    body: formatBody(message),
  };
}

const formatSuccessResponse = (body: any = undefined, statusCode = 200) => ({
  statusCode,
  body: JSON.stringify(body),
  headers: makeHeaders(),
});

const songsService = new SongsService();

// List Songbooks API
export const listSongbooks = async () => {
  try {
    return formatSuccessResponse(await songsService.getSongbooks());
  } catch (e) {
    return formatErrorResponse(e);
  }
};

export const getSongbook = async (songbookId: string) => {
  try {
    return formatSuccessResponse(await songsService.getSongbook(songbookId));
  } catch (e) {
    return formatErrorResponse(e);
  }
};

// List Songs API
export const listSongs = async (songbookId: string | undefined) => {
  try {
    if (songbookId === undefined || songbookId === "") {
      throw new NotFoundError();
    }
    validateGetSongsRequest(songbookId);
    return formatSuccessResponse(await songsService.getSongsMethod(songbookId));
  } catch (e) {
    return formatErrorResponse(e);
  }
};

// Get Song [With Lyrics] API
export const getSong = async (songbookId: string, songNumber: number) => {
  try {
    if (songbookId === undefined || songNumber === undefined) {
      throw new NotFoundError();
    }
    validateGetSongRequest(songbookId, songNumber);
    return formatSuccessResponse(
      await songsService.getSongWithLyrics(songbookId, songNumber)
    );
  } catch (e) {
    return formatErrorResponse(e);
  }
};

// List Pending Songs API
export const listPendingSongs = async () =>
  formatSuccessResponse(await songsService.getPendingSongs());

// Create Songbook API
// TODO: Make this a "protected"/internal API
export const createSongbook = async (
  songbookId: string,
  createSongbookRequest: Songbook
) => {
  console.log(`Create Songbook API Request received`);
  const songbook = toSongbook(createSongbookRequest);
  songbook.id = songbookId;
  try {
    validateInsertSongbookRequest(songbook);
    await songsService.insertSongbookMethod(songbook);
  } catch (e) {
    return formatErrorResponse(e);
  }
  return formatSuccessResponse(`/songbooks/${songbook.id}`, 201);
};

// Create Lyric API
// TODO: Make this a "protected"/internal API
const createLyrics = async (songId: string, lyrics: Lyric[]) => {
  const promises = [];
  for (let i = 0; i < lyrics.length; i++) {
    const lyric = lyrics[i];
    lyric.songId = songId;
    validateInsertLyricRequest(lyric);
    promises.push(songsService.insertLyricMethod(lyric));
  }
  return Promise.all(promises);
};

// Create Song API
// TODO: Make this a "protected"/internal API
export const createSong = async (
  bookId: string,
  number: number,
  request: CreateSongRequest
) => {
  console.log(
    `Create Song API Request received for book ${bookId}: ${JSON.stringify(
      request
    )}`
  );
  let isCreation = false;
  const song = toSong(request);

  const existingSongResponse = await getSong(song.songbookId, song.number);
  if (existingSongResponse.statusCode === 200) {
    // A song already exists for this song number; confirm the IDs match
    const existingSong = JSON.parse(
      existingSongResponse.body as string
    ) as SongWithLyrics;
    if (existingSong.id !== song.id) {
      return {
        statusCode: 422,
        body: "ID does not match existing song of this book and number combination",
      };
    }
  } else {
    isCreation = true;
    song.id = randomUUID();
  }
  song.songbookId = bookId;
  song.number = number;

  try {
    validateInsertSongRequest(song);
    await songsService.upsertSongMethod(song);
    await createLyrics(song.id, request.lyrics);
  } catch (e) {
    return formatErrorResponse(e);
  }
  return formatSuccessResponse(
    `/songbooks/${bookId}/songs/${number}`,
    isCreation ? 201 : 200
  );
};

// Create Pending Song API
export const createPendingSong = async (event: APIGatewayEvent) => {
  console.log(`Create Pending Song API Request received: ${event.path}`);
  const pendingSong = toPendingSong(event.body);
  validateInsertPendingSongRequest(pendingSong);
  const val = await songsService.insertPendingSongMethod(pendingSong);
  console.log(`Returning ${JSON.stringify(val)}`);
  return val ?? {};
};

// TODO: Make this a "protected"/internal API
export const rejectPendingSong = async (event: APIGatewayEvent) => {
  console.log(`Reject Pending Song API Request received: ${event.path}`);
  const request = toRejectPendingSongRequest(event.body);
  try {
    validateRejectPendingSongRequest(request);
    await songsService.rejectPendingSongMethod(
      request.pendingSong,
      request.rejectionReason
    );
    return formatSuccessResponse();
  } catch (e) {
    return formatErrorResponse(e);
  }
};

// TODO: Make this a "protected"/internal API
export const acceptPendingSong = async (event: APIGatewayEvent) => {
  console.log(`Accept Pending Song API Request received: ${event.path}`);
  const request = toAcceptPendingSongRequest(event.body);
  try {
    validateAcceptPendingSongRequest(request);
    await songsService.acceptPendingSongMethod(
      request.pendingSong,
      request.acceptanceNote
    );
    return formatSuccessResponse();
  } catch (e) {
    return formatErrorResponse(e);
  }
};

export const findSong = async (request: SearchRequest) => {
  validateSearchRequest(request);
  const matchedSongs = await songsService.searchSongs(
    request.searchText,
    request.songbook
  );
  try {
    const response: SearchResponse = {
      matchedSongs,
    };
    console.log(
      `Returning ${matchedSongs.length} songs with search string: "${request.searchText}" and songbook: "${request.songbook}"`
    );
    return formatSuccessResponse(response);
  } catch (e) {
    return formatErrorResponse(e);
  }
  // TODO: Write search API which takes in a search string, and maybe other filters, and returns a list of songs which matches.
};
