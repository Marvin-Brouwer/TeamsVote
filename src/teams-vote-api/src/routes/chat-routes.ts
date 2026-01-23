import { FastifyInstance } from "fastify";
import { TurnContext } from "botbuilder";
import { ChatBot } from "../utilities/chatbot.js";
import { teamsAdapter } from "../utilities/teams-adapter.js";
const bot = new ChatBot();

export function applyChatHandler(app: FastifyInstance) {

    app.post('/chatbot/messages', async (request, reply) => {
        // Wrap Fastify's raw req/res to look like Express
        const req = Object.assign(request.raw, {
            body: request.body as any
        });
        const res = {
            ...reply.raw,          // ServerResponse
            // Provide the minimal Express-style methods CloudAdapter expects
            status: (code: number) => { reply.code(code); return res; },
            send: (body?: any) => { reply.send(body); return res; },
            setHeader: (name: string, value: string) => { reply.header(name, value); return res; },
            end: (...args: unknown[]) => {
                for (const arg of args) reply.send(arg)
                reply.raw.end()
            },
            header: reply.raw.getHeader
        };

        try {
            app.log.info(`Incoming request ${JSON.stringify(req.body)}`)
            await teamsAdapter.process(req, res, async (context: TurnContext) => {
                app.log.info(`TurnContext activity ${JSON.stringify(context.activity)}`);
                context.onSendActivities(async (_c, a, n) => {
                    app.log.info(`onSendActivities ${JSON.stringify(a)}`);
                    return await n();
                })
                await bot.run(context);
            });
        } catch (err) {
            console.error("Unexpected teams bot error:", err);
            return reply.code(500).send(JSON.stringify(err));
        }
    });
}