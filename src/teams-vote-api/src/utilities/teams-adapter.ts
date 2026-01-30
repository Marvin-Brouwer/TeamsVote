import { CloudAdapter, ConfigurationBotFrameworkAuthentication, ConfigurationServiceClientCredentialFactory } from "botbuilder";

export const BOT_APP_ID = process.env.TEAMS_CHATBOT_CLIENT_ID!;
export const BOT_APP_PASSWORD = process.env.TEAMS_CHATBOT_CLIENT_SECRET!;

const authConfig = {
    MicrosoftAppId: BOT_APP_ID,
    MicrosoftAppPassword: BOT_APP_PASSWORD,
}
const credentialFactory = new ConfigurationServiceClientCredentialFactory({
    ...authConfig,
    MicrosoftAppType: 'bot'
});

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(authConfig, credentialFactory);

export const teamsAdapter = new CloudAdapter(botFrameworkAuthentication);
