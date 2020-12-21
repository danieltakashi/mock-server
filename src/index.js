import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import { routes } from '../src/routes/index.js';

const app = express();
const host = process.env.APP_HOST;
const port = process.env.APP_PORT;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', routes());

app.listen(port, () => {
  console.info(`Server started at ${host}:${port}/`);
});

export default app;
