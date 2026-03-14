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
  listSongsByAuthor,
  submitFeedback,
} from "./api";
import { Feedback, Songbook, toSearchRequest } from "./models/ApiModels";

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

export const listSongbooksHandler = async () => listSongbooks();

export const getSongbookHandler = async (event: APIGatewayEvent) =>
  getSongbook(parseSongbookId(event));

export const createSongbookHandler = async (event: APIGatewayEvent) => {
  console.log(event);
  const creationRequest = JSON.parse(event.body!) as Songbook;
  const songbookId = parseSongbookId(event);
  return createSongbook(songbookId, creationRequest);
};

export const listSongsHandler = async (event: APIGatewayEvent) => {
  console.log(event);
  const songbookId = parseSongbookId(event);
  return listSongs(songbookId);
};

export const getSongHandler = async (event: APIGatewayEvent) => {
  console.log(event);
  const songbookId = parseSongbookId(event);
  const songNumber = parseSongNumber(event);
  return getSong(songbookId, songNumber);
};

export const createSongHandler = async (event: APIGatewayEvent) => {
  console.log(event);
  const songbookId = parseSongbookId(event);
  const creationRequest = JSON.parse(event.body!);
  const number = parseSongNumber(event);
  return createSong(songbookId, number, creationRequest);
};

export const searchSongsHandler = async (event: APIGatewayEvent) => {
  console.log(`Search API Request received: ${event}`);
  const requestJson = JSON.parse(event.body!);
  const searchRequest = toSearchRequest(requestJson);
  return findSong(searchRequest);
};

const postFeedbackHandler = async (event: APIGatewayEvent) => {
  console.log(`Post Feedback API Request received: ${event}`);
  const feedbackRequest = JSON.parse(event.body!) as Feedback;
  return submitFeedback(feedbackRequest);
};

const listSongsByAuthorHandler = async (event: APIGatewayEvent) => {
  console.log(`Get Author API Request received: ${event}`);
  const authorName = event.pathParameters?.authorName;
  if (authorName === undefined) {
    throw new Error("Author name was undefined");
  }
  return listSongsByAuthor(authorName);
};

export const lambdaRequestHandler = async (
  event: APIGatewayEvent
): Promise<any> => {
  console.log("Received request ", event);
  const notFound = { statusCode: 404 };
  switch (event.resource) {
    case "/search":
      switch (event.httpMethod) {
        case "POST":
          return searchSongsHandler(event);
        default:
          return notFound;
      }
    case "/songbooks":
      switch (event.httpMethod) {
        case "GET":
          return listSongbooksHandler();
        default:
          return notFound;
      }
    case "/songbooks/{songbookId}":
      switch (event.httpMethod) {
        case "GET":
          return getSongbookHandler(event);
        default:
          return notFound;
      }
    case "/songbooks/{songbookId}/songs":
      switch (event.httpMethod) {
        case "GET":
          return listSongsHandler(event);
        default:
          return notFound;
      }
    case "/feedback":
      switch (event.httpMethod) {
        case "POST":
          return postFeedbackHandler(event);
        default:
          return notFound;
      }
    case "/songbooks/{songbookId}/songs/{songNumber}":
      switch (event.httpMethod) {
        case "GET":
          return getSongHandler(event);
        case "PUT":
          return createSongHandler(event);
        default:
          return notFound;
      }
    case "/authors/{authorName}/songs":
      switch (event.httpMethod) {
        case "GET":
          return listSongsByAuthorHandler(event);
        default:
          return notFound;
      }
    default:
      return notFound;
  }
};
