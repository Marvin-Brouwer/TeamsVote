// src/server.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import { v4 as uuid } from "uuid";
import { SessionData, sessions, Submission } from './state';
import { Session } from "./state";
import { Mutex } from "async-mutex";

const sessionLocks = new Map<string, Mutex>();

const app = Fastify({ logger: true });
app.register(cors, { origin: true });

// Start a round
app.post("/start", async (request, reply) => {
  const body = request.body as { roundKey: string, meetingId: string, type?: 'points' | 't-shirt' };
  const { roundKey, meetingId, type } = body;

  if (!meetingId) return reply.status(400).send({ error: "meetingId required" });
  if (!roundKey) return reply.status(400).send({ error: "roundKey required" });

  const roundToken = uuid();

  const session: Session = {
    meetingId,
    roundKey,
    token: roundToken,
    type: type ?? 'points',
    submissions: []
  }

  sessions.set(meetingId, session);

  return session;
});

function getMutex(meetingId: string) {
  let mutex = sessionLocks.get(meetingId);
  if (!mutex) {
    mutex = new Mutex();
    sessionLocks.set(meetingId, mutex);
  }
  return mutex;
}

app.post("/submit", async (request, reply) => {
  const body = request.body as SessionData & Submission<'points' | 't-shirt'>;
  const { meetingId, roundKey, token, user, score } = body;

  const mutex = getMutex(meetingId);

  return mutex.runExclusive(() => {
    const session = sessions.get(meetingId);
    if (!session || session.roundKey !== roundKey || session.token !== token) {
      reply.status(404);
      return { error: "Session not found" };
    }

    session.submissions.push({ user, score });
    sessions.set(meetingId, session);

    return { status: "ok" };
  });
});

app.post("/aggregate", async (request, reply) => {
  const body = request.body as SessionData;
  const { meetingId, roundKey, token } = body;

  const session = sessions.get(meetingId);
  if (!session || session.roundKey !== roundKey || session.token !== token) {
    reply.status(404);
    return { error: "Session not found" };
  }

  const result = {
    submissions: session.submissions,
    average: calculateAverage(session.type, session.submissions)
  }

  sessions.delete(meetingId);

  return { result };
});

function calculateAverage(type: 'points' | 't-shirt', submissions: Submission<'points' | 't-shirt'>[]) {
  if (type === 'points') return calculateAveragePoints(submissions)
  return calculateAverageShirt(submissions);
}

function calculateAveragePoints(submissions: Submission<'points'>[]) {
  const scores = [];
  for (const point of submissions) {
    if (point.score === '?') continue;
    if (point.score === 'skip') continue;
    scores.push(point.score)
  }

  return scores.reduce((prev, current) => prev + current, 0) / scores.length
}

function calculateAverageShirt(submissions: Submission<'t-shirt'>[]) {
  const scores = [];
  for (const point of submissions) {
    if (point.score === '?') continue;
    if (point.score === 'skip') continue;
    scores.push(point.score)
  }

  throw new Error('Not yet implemented')
}

// Start server
const port = Number(process.env.PORT) || 3000;
app.listen({ port }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`API running at ${address}`);
});
