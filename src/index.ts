import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import {querySongbooks} from './db/SongsDb';
import {toDbSongbook} from './db/DbModels';
import {validateInsertSongbookRequest} from './helpers/RequestValidationHelpers';
import {insertSongbookMethod} from './services/SongsService';
import {Response} from 'express-serve-static-core';
import {DatabaseError, ValidationError} from './helpers/ErrorHelpers';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../web-build')));

const PORT = process.env.PORT || 3000;

app.get('/hi', (req, res) => {
  res.status(200).send('hello');
});

app.get('/db', async (req, res) => {
  querySongbooks().then((val) => {
    res.status(200).send(val);
  });
});

// TODO: Make this a real POST api later
app.get('/songbooks', (req, res) => {
  try {
    console.log(`Create Songbooks API Request received: ${req.url}`);
    const dbSongbook = toDbSongbook(req.query);
    validateInsertSongbookRequest(dbSongbook);
    insertSongbookMethod(dbSongbook).then((val) => {
      console.log(`Returning ${val}`);
      res.status(200).send(val ?? {});
    });
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
    res.status(400).send(`Validation Error: ${e.message}`)
  } else if (e instanceof DatabaseError) {
    res.status(400).send(`Db Error: ${e.message}`);
  } else {
    res.status(400).send(`Error: Bad Request: ${e.message}`);
  }
}
