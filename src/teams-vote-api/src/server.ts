// src/server.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import { v4 as uuid } from "uuid";
import { Deck, SessionData, sessions, Submission } from './state';
import { Session } from "./state";
import { Mutex } from "async-mutex";
import { calculateAverage, validateScore } from "./average";

const sessionLocks = new Map<string, Mutex>();

const app = Fastify({ logger: true });
app.register(cors, { origin: true });

// Start a round
app.post("/start", async (request, reply) => {
  const body = request.body as { roundKey: string, meetingId: string, type: Deck };
  const { roundKey, meetingId, type } = body;

  if (!meetingId) return reply.status(400).send({ error: "meetingId required" });
  if (!roundKey) return reply.status(400).send({ error: "roundKey required" });
  if (!type) return reply.status(400).send({ error: "type required" });

  const roundToken = uuid();

  const session: Session = {
    meetingId,
    roundKey,
    token: roundToken,
    type,
    submissions: new Map()
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
  const body = request.body as SessionData & Submission<Deck>;
  const { meetingId, roundKey, token, user, score } = body;

  const mutex = getMutex(meetingId);

  return mutex.runExclusive(() => {
    const session = sessions.get(meetingId);
    if (!session || session.roundKey !== roundKey || session.token !== token) {
      reply.status(404);
      return { error: "Session not found" };
    }

    if (!validateScore(session.type, score)) {
        reply.status(403);
        return { error: "Incorrect score" };
    }

    session.submissions.set(user.id, { user, score });
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

  const submissions = Array.from(session.submissions.values());
  const result = {
    submissions,
    average: calculateAverage(session.type, submissions)
  }

  sessions.delete(meetingId);

  return { result };
});

// Start server
const port = Number(process.env.PORT) || 3000;
app.listen({ port }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`API running at ${address}`);
});
