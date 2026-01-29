// src/server.ts
import express, { NextFunction, Request, Response } from 'express';
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
  .use(logRequest)
  .get("/", checkHealth)
  .get("/health", checkHealth)
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
  .on('request', waitForHealthCheck)

function checkHealth(_req: unknown, res: Response) {
  console.debug('Health check called');
  return res.status(200).send({ status: "healthy" });
}
function waitForHealthCheck(req: Request) {
  if (req.url !== '/health') return;
  console.log('Initial health check called, we are live!');
  app.off('request', waitForHealthCheck)
}
function logRequest(req: Request, res: Response, next: NextFunction) {
  if (req.url === '/health') return next()

  if (!req.body) console.debug(`${req.method} ${req.originalUrl}`)
  else console.debug(`${req.method} ${req.originalUrl} => `, req.body)

  next()
  console.debug(`${req.method} ${req.originalUrl} <= `, res.statusCode, res.statusMessage)
}