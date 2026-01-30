import { CloudAdapter, ConfigurationBotFrameworkAuthentication, ConfigurationServiceClientCredentialFactory } from "botbuilder";

export const BOT_APP_ID = process.env.TEAMS_CHATBOT_CLIENT_ID!;
export const BOT_APP_PASSWORD = process.env.TEAMS_CHATBOT_CLIENT_SECRET!;

// Temporary debugging - TODO remove after fixing
console.log('BOT_APP_ID:', BOT_APP_ID);
console.log('BOT_APP_PASSWORD exists:', !!BOT_APP_PASSWORD);
console.log('BOT_APP_PASSWORD length:', BOT_APP_PASSWORD?.length);

const authConfig = {
    MicrosoftAppId: BOT_APP_ID,
    MicrosoftAppPassword: BOT_APP_PASSWORD,
    MicrosoftAppType: 'MultiTenant',
    MicrosoftAppTenantId: process.env.TEAMS_PLUGIN_TENANT_ID // TODO TEAMS_PLUGIN_TENANT_ID is for transitioning SHOULD BE: '' // Empty for multi-tenant
}
const credentialFactory = new ConfigurationServiceClientCredentialFactory(authConfig);
const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
    // The ConfigurationBotFrameworkAuthentication constructor expects an empty config object as the first parameter when you're using a credential factory 
    // - all the auth config should be in the credentialFactory, not duplicated in both places.
    { }, 
    credentialFactory
);

export const teamsAdapter = new CloudAdapter(botFrameworkAuthentication);
