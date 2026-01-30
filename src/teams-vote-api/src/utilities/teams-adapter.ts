import { CloudAdapter, ConfigurationBotFrameworkAuthentication } from "botbuilder";

export const TENANT = process.env.TEAMS_PLUGIN_TENANT_ID!;
export const BOT_APP_ID = process.env.TEAMS_CHATBOT_CLIENT_ID!;
export const BOT_APP_PASSWORD = process.env.TEAMS_CHATBOT_CLIENT_SECRET!;

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication({
    MicrosoftAppId: BOT_APP_ID,
    MicrosoftAppPassword: BOT_APP_PASSWORD,
    MicrosoftAppTenantId: TENANT // TODO optional, do we need it?
});

export const teamsAdapter = new CloudAdapter(botFrameworkAuthentication);