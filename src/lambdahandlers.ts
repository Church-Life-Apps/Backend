import "dotenv/config";
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

import {
  createSong,
  createSongbook,
  findSong,
  getSong,
  getSongbook,
  listSongbooks,
  listSongs,
} from "./api";
import { Songbook, toSearchRequest } from "./models/ApiModels";

/**
 * Parses the songbook ID from an API Gateway Event's path parameters
 */
const parseSongbookId = (event: APIGatewayEvent) => {
  const songbookId = event.pathParameters?.songbookId;
  if (songbookId === undefined) {
    throw new Error("Songbook ID was undefined");
  }
  return songbookId;
};

/**
 * Parses the song number from an API Gateway Event's path parameters
 */
const parseSongNumber = (event: APIGatewayEvent) => {
  const number = event.pathParameters?.songNumber;
  if (number === undefined) {
    throw new Error("Song number was undefined");
  }
  return parseInt(number, 10);
};

export const listSongbooksHandler: Handler = async () => listSongbooks();

export const getSongbookHandler: Handler = async (event: APIGatewayEvent) =>
  getSongbook(parseSongbookId(event));

export const createSongbookHandler: Handler = async (
  event: APIGatewayEvent
) => {
  console.log(event);
  const creationRequest = JSON.parse(event.body!) as Songbook;
  const songbookId = parseSongbookId(event);
  return createSongbook(songbookId, creationRequest);
};

export const listSongsHandler: Handler = async (event: APIGatewayEvent) => {
  console.log(event);
  const songbookId = parseSongbookId(event);
  return listSongs(songbookId);
};

export const getSongHandler: Handler = async (event: APIGatewayEvent) => {
  console.log(event);
  const songbookId = parseSongbookId(event);
  const songNumber = parseSongNumber(event);
  return getSong(songbookId, songNumber);
};

export const createSongHandler: Handler = async (event: APIGatewayEvent) => {
  console.log(event);
  const songbookId = parseSongbookId(event);
  const creationRequest = JSON.parse(event.body!);
  const number = parseSongNumber(event);
  return createSong(songbookId, number, creationRequest);
};

export const searchSongsHandler: Handler = async (event: APIGatewayEvent) => {
  console.log(`Search API Request received: ${event}`);
  const requestJson = JSON.parse(event.body!);
  const searchRequest = toSearchRequest(requestJson);
  return findSong(searchRequest);
};

export const lambdaRequestHandler: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback<any>
) => {
  console.log("Received request ", event);
  const notFound = { statusCode: 404 };
  switch (event.resource) {
    case "/search":
      switch (event.httpMethod) {
        case "POST":
          return searchSongsHandler(event, context, callback);
        default:
          return notFound;
      }
    case "/songbooks":
      switch (event.httpMethod) {
        case "GET":
          return listSongbooksHandler(event, context, callback);
        default:
          return notFound;
      }
    case "/songbooks/{songbookId}":
      switch (event.httpMethod) {
        case "GET":
          return getSongbookHandler(event, context, callback);
        default:
          return notFound;
      }
    case "/songbooks/{songbookId}/songs":
      switch (event.httpMethod) {
        case "GET":
          return listSongsHandler(event, context, callback);
        default:
          return notFound;
      }
    case "/songbooks/{songbookId}/songs/{songNumber}":
      switch (event.httpMethod) {
        case "GET":
          return getSongHandler(event, context, callback);
        case "PUT":
          return createSongHandler(event, context, callback);
        default:
          return notFound;
      }
    default:
      return notFound;
  }
};
