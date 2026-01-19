import { FastifyInstance } from "fastify";
import { CloudAdapter, ConfigurationBotFrameworkAuthentication, ConfigurationServiceClientCredentialFactory, TurnContext } from "botbuilder";
import { ChatBot } from "../utilities/chatbot.js";

const TENANT = process.env.TEAMS_PLUGIN_TENANT_ID!;
const APP_ID = process.env.TEAMS_CHATBOT_CLIENT_ID!;
const APP_PASSWORD = process.env.TEAMS_CHATBOT_CLIENT_SECRET!;

const bot = new ChatBot();
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppTenantId: TENANT,
    MicrosoftAppId: APP_ID,
    MicrosoftAppPassword: APP_PASSWORD,
    MicrosoftAppType: 'chatbot'
})
const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication({ MicrosoftAppId: APP_ID, MicrosoftAppTenantId: TENANT }, credentialsFactory);

const adapter = new CloudAdapter(botFrameworkAuthentication);
adapter.onTurnError = async (context: TurnContext, error: Error) => {
    console.error("Bot error:", error);
    await context.sendActivity("Oops, something went wrong!");
};

export function applyChatHandler(app: FastifyInstance) {
    app.post("/chatbot/messages", async (request, reply) => {
        // Wrap Fastify's raw req/res to look like Express
        const req = request.raw;   // IncomingMessage
        const res = {
            ...reply.raw,          // ServerResponse
            // Provide the minimal Express-style methods CloudAdapter expects
            status: (code: number) => { reply.code(code); return res; },
            send: (body?: any) => { reply.send(body); return res; },
            setHeader: (name: string, value: string) => { reply.header(name, value); return res; }
        } as any;

        await adapter.process(req, res, async (context: TurnContext) => {
            await bot.run(context);
        });

        reply.code(200).send();
    });
}