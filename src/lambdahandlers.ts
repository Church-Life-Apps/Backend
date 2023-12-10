import "dotenv/config";
import { APIGatewayEvent, Handler } from "aws-lambda";

import NotFoundError from "./errors/NotFoundError";
import {
  acceptPendingSong,
  createLyrics,
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

export const handler: Handler = async (event: APIGatewayEvent) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  let body;
  const statusCode = "200";
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.path) {
      case "/songbooks":
        if (event.httpMethod === "GET") {
          body = await listSongbooks();
        } else if (event.httpMethod === "POST") {
          body = await createSongbook(event);
        } else {
          throw new Error("Method not supported");
        }
        break;
      case "/songbooks/{songbookId}":
        if (event.httpMethod === "GET") {
          body = await listSongs(event);
        } else if (event.httpMethod === "POST") {
          await createSong(event);
        } else {
          throw new Error("Method not supported");
        }
        break;
      case "/songbooks/{songbookId}/{songId}":
        if (event.httpMethod === "GET") {
          body = await getSong(event);
        } else if (event.httpMethod === "POST") {
          await createLyrics(event);
        } else {
          throw new Error("Method not supported");
        }
        break;
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
