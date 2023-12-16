import "dotenv/config";
import { APIGatewayEvent, Handler } from "aws-lambda";

import {
  createSong,
  createSongbook,
  getSong,
  getSongbook,
  listSongbooks,
  listSongs,
} from "./api";
import { Songbook } from "./models/ApiModels";

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
