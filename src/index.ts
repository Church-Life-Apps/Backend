import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import queryDb from './db/SongsDb';

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
  queryDb()
    .then((val) => {
        res.status(200).send(val);
    });
});

app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname, '../web-build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
