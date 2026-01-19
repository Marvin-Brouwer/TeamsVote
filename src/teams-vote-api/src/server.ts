// src/server.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import { applySessionRoutes } from "./routes/session-routes.js";
import { applyChatHandler } from "./routes/chat-routes.js";

const app = Fastify({ logger: true });
app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "OPTIONS"]
});

applySessionRoutes(app);
applyChatHandler(app);

// Start server
const port = Number(process.env.PORT) || 10000;
app.listen({ port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`API running at ${address}`);
});
