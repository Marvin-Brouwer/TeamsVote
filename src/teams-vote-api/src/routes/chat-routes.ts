import { FastifyInstance } from "fastify";
import { CloudAdapter, ConfigurationBotFrameworkAuthentication, ConfigurationServiceClientCredentialFactory, ConfigurationServiceClientCredentialFactoryOptions, createBotFrameworkAuthenticationFromConfiguration, TurnContext } from "botbuilder";
import { ChatBot } from "../utilities/chatbot.js";

const TENANT = process.env.TEAMS_PLUGIN_TENANT_ID!;
const APP_ID = process.env.TEAMS_CHATBOT_CLIENT_ID!;
const APP_PASSWORD = process.env.TEAMS_CHATBOT_CLIENT_SECRET!;

const bot = new ChatBot();
const credentialOptions: ConfigurationServiceClientCredentialFactoryOptions = {
    MicrosoftAppTenantId: TENANT,
    MicrosoftAppId: APP_ID,
    MicrosoftAppPassword: APP_PASSWORD,
    MicrosoftAppType: 'chatbot'
}
const credentialsFactory = new ConfigurationServiceClientCredentialFactory(import.meta.env.DEV ? { } : credentialOptions)

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication({
    MicrosoftAppId: APP_ID,
    MicrosoftAppTenantId: TENANT
}, credentialsFactory);


const adapter = new CloudAdapter(botFrameworkAuthentication);
adapter.onTurnError = async (context: TurnContext, error: Error) => {
    console.error("Bot error:", error);
    await context.sendActivity("Oops, something went wrong!");
};

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
            await adapter.process(req, res, async (context: TurnContext) => {
                await bot.run(context);
            });
        } catch (err) {
            console.error("Unexpected teams bot error:", err);
            return reply.code(500).send(JSON.stringify(err));
        }
    });
}