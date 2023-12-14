import "dotenv/config";
import { APIGatewayEvent, Handler } from "aws-lambda";

import NotFoundError from "./errors/NotFoundError";
import {
  acceptPendingSong,
  createPendingSong,
  createSong,
  createSongbook,
  findSong,
  getSong,
  listPendingSongs,
  listSongbooks,
  listSongs,
  rejectPendingSong,
} from "./api";

export const listSongbooksHandler: Handler = async () => listSongbooks();

export const createSongbookHandler: Handler = async (
  event: APIGatewayEvent
) => {
  console.log(event);
  const creationRequest = JSON.parse(event.body!);
  return createSongbook(creationRequest);
};

export const listSongsHandler: Handler = async (event: APIGatewayEvent) => {
  console.log(event);
  const songbookId = event.pathParameters?.songbookId;
  if (songbookId === undefined) {
    throw new Error("Songbook ID was undefined");
  }
  return listSongs(songbookId);
};

export const createSongHandler: Handler = async (event: APIGatewayEvent) => {
  console.log(event);
  const songbookId = event.pathParameters?.songbookId;
  const creationRequest = JSON.parse(event.body!);

  if (songbookId === undefined) {
    throw new Error("Songbook ID was undefined");
  }
  const number = event.pathParameters?.songNumber;
  if (number === undefined) {
    throw new Error("Song number was undefined");
  }
  return createSong(songbookId, parseInt(number, 10), creationRequest);
};

export const getSongHandler: Handler = async (event: APIGatewayEvent) => {
  console.log(event);
  const songbookId = event.pathParameters?.songbookId;
  const songNumber = event.pathParameters?.songNumber;
  if (songbookId === undefined) {
    throw new Error("songbookId is undefined");
  }
  if (songNumber === undefined) {
    throw new Error("songNumber is undefined");
  }
  return getSong(songbookId, parseInt(songNumber, 10));
};

export const handler: Handler = async (event: APIGatewayEvent) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  let body;
  const statusCode = "200";
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.path) {
      case "/pending/songs":
        if (event.httpMethod === "GET") {
          body = await listPendingSongs();
        } else if (event.httpMethod === "POST") {
          await createPendingSong(event);
        } else {
          throw new Error("Method not supported");
        }
        break;
      case "/pending/songs/accept":
        if (event.httpMethod === "GET") {
          body = await acceptPendingSong(event);
        } else {
          throw new Error("Method not supported");
        }
        break;
      case "/pending/songs/reject":
        if (event.httpMethod === "GET") {
          body = await rejectPendingSong(event);
        } else {
          throw new Error("Method not supported");
        }
        break;
      case "/search":
        if (event.httpMethod === "GET") {
          body = await findSong(event);
        } else {
          throw new Error("Method not supported");
        }
        break;
      default:
        throw new NotFoundError();
    }
  } catch (err) {
    // return formatErrorResponse(err);
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
