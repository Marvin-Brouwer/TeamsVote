// src/server.ts
import express from 'express';
import cors from "cors";
import { sessionRoutes } from "./routes/session-routes.js";
import { chatRoutes } from './routes/chat-routes.js';

const port = Number(process.env.PORT) || 10000;
const app = express()
  .use(express.json())
  .use(cors({
    methods: ["GET", "POST", "OPTIONS"],
    origin: true
  }))
  .use(async (req, res, next) => {
    console.debug(`${req.method} ${req.originalUrl} => `, req.body)
    next()
    console.debug(`${req.method} ${req.originalUrl} <= `, res.statusCode, res.statusMessage)
  })
  .get("/", (_, res) => {
    return res.status(200).send({ status: "healthy" });
  })
  .get("/health", (_, res) => {
    return res.status(200).send({ status: "healthy" });
  })
  .use('/api', sessionRoutes)
  .use('/chatbot', chatRoutes)
  .listen(port, '0.0.0.0', (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  })
  .once('listening', () => {
    console.log(`API running on`, app.address());
  })
  .once('request', (req) => {
    console.log('first request', req.url);
  })
