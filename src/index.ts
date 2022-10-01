import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;

app.get('/hi', (req, res) => {
  res.status(200).send('hello')
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});