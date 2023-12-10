import { APIGatewayEvent } from "aws-lambda";
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
import NotFoundError from "./errors/NotFoundError";

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
    statusCode = 400;
    message = `Db Error: ${e.message}`;
  } else if (e instanceof NotFoundError) {
    statusCode = 404;
  } else {
    console.error(e);
    message = `Internal server error`;
  }

  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: formatBody(message),
  };
}

const formatSuccessResponse = (body: any) => ({
  statusCode: 200,
  body,
  headers: { "Conent-Type": "application/json" },
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

// List Songs API
export const listSongs = async (event: APIGatewayEvent) => {
  try {
    const songbookId = event.pathParameters?.songbookId;
    if (songbookId === undefined) {
      throw new NotFoundError();
    }
    validateGetSongsRequest(songbookId);
    return await songsService.getSongsMethod(songbookId);
  } catch (e) {
    return formatErrorResponse(e);
  }
};

// Get Song [With Lyrics] API
export const getSong = async (event: APIGatewayEvent) => {
  const songbookId = event.pathParameters?.songbookId;
  const number = event.pathParameters?.songNumber;
  if (songbookId === undefined || number === undefined) {
    throw new NotFoundError();
  }
  validateGetSongRequest(songbookId, number);
  return songsService.getSongWithLyricsMethod(songbookId, parseInt(number, 10));
};

// List Pending Songs API
export const listPendingSongs = () => songsService.getPendingSongs();

// Create Songbook API
// TODO: Make this a "protected"/internal API
export const createSongbook = async (event: APIGatewayEvent) => {
  console.log(`Create Songbook API Request received`);
  const songbook = toSongbook(event.body);
  validateInsertSongbookRequest(songbook);
  const val = await songsService.insertSongbookMethod(songbook);
  console.log(`Returning ${JSON.stringify(val)}`);
  return val ?? {};
};

// Create Song API
// TODO: Make this a "protected"/internal API
export const createSong = async (event: APIGatewayEvent) => {
  console.log(`Create Song API Request received: ${event.path}`);
  const song = toSong(event.body);
  validateInsertSongRequest(song);
  const val = await songsService.upsertSongMethod(song);
  console.log(`Returning ${JSON.stringify(val)}`);
  return val ?? {};
};

// Create Lyric API
// TODO: Make this a "protected"/internal API
export const createLyrics = async (event: APIGatewayEvent) => {
  console.log(`Create Lyric API Request received: ${event.path}`);
  const lyric = toLyric(event.body);
  validateInsertLyricRequest(lyric);
  const val = await songsService.insertLyricMethod(lyric);
  console.log(`Returning ${JSON.stringify(val)}`);
  return val ?? {};
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
  validateRejectPendingSongRequest(request);
  await songsService.rejectPendingSongMethod(
    request.pendingSong,
    request.rejectionReason
  );
};

// TODO: Make this a "protected"/internal API
export const acceptPendingSong = async (event: APIGatewayEvent) => {
  console.log(`Accept Pending Song API Request received: ${event.path}`);
  const request = toAcceptPendingSongRequest(event.body);
  validateAcceptPendingSongRequest(request);
  await songsService.acceptPendingSongMethod(
    request.pendingSong,
    request.acceptanceNote
  );
};

export const findSong = async (event: APIGatewayEvent) => {
  console.debug(`Search API Request received: ${event.path}`);
  const request = toSearchRequest(event.body);
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
  return response ?? {};
  // TODO: Write search API which takes in a search string, and maybe other filters, and returns a list of songs which matches.
};
