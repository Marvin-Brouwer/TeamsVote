// src/server.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import { v4 as uuid } from "uuid";
import { sessions } from "./state";

const app = Fastify({ logger: true });

// Enable CORS
app.register(cors, { origin: true });

// Start a round
app.post("/start", async (request, reply) => {
  const body = request.body as { meetingId: string };
  const { meetingId } = body;

  if (!meetingId) return reply.status(400).send({ error: "meetingId required" });

  const roundId = uuid();
  if (!sessions.has(meetingId)) {
    sessions.set(meetingId, new Map());
  }

  sessions.get(meetingId)!.set(roundId, { submissions: [] });

  return { roundId };
});

// Submit input
app.post("/submit", async (request, reply) => {
  const body = request.body as { meetingId: string; roundId: string; userId: string; input: any };
  const { meetingId, roundId, userId, input } = body;

  const round = sessions.get(meetingId)?.get(roundId);
  if (!round) return reply.status(404).send({ error: "Round not found" });

  round.submissions.push({ userId, input });
  return { status: "ok" };
});

// Aggregate results
app.post("/aggregate", async (request, reply) => {
  const body = request.body as { meetingId: string; roundId: string };
  const { meetingId, roundId } = body;

  const round = sessions.get(meetingId)?.get(roundId);
  if (!round) return reply.status(404).send({ error: "Round not found" });

  const result = round.submissions.map(s => s.input);
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
