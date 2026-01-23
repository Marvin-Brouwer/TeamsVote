import { CloudAdapter, ConfigurationBotFrameworkAuthentication, ConfigurationServiceClientCredentialFactory, ConfigurationServiceClientCredentialFactoryOptions, TurnContext } from "botbuilder";

export const TENANT = process.env.TEAMS_PLUGIN_TENANT_ID!;
export const APP_ID = process.env.TEAMS_CHATBOT_CLIENT_ID!;
export const APP_PASSWORD = process.env.TEAMS_CHATBOT_CLIENT_SECRET!;

const credentialOptions: ConfigurationServiceClientCredentialFactoryOptions = {
    MicrosoftAppTenantId: TENANT,
    MicrosoftAppId: APP_ID,
    MicrosoftAppPassword: APP_PASSWORD,
    MicrosoftAppType: 'chatbot'
}
const credentialsFactory = new ConfigurationServiceClientCredentialFactory(import.meta.env.DEV ? {} : credentialOptions)

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication({
    MicrosoftAppId: APP_ID,
    MicrosoftAppTenantId: TENANT
}, credentialsFactory);


const adapter = new CloudAdapter(botFrameworkAuthentication);
adapter.onTurnError = async (context: TurnContext, error: Error) => {
    console.error("Bot error:", error);
    await context.sendActivity("Oops, something went wrong!");
};

export const teamsAdapter = adapter;