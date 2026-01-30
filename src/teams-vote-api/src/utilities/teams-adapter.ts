import { BotFrameworkAdapter, CloudAdapter, ConfigurationBotFrameworkAuthentication, ConfigurationServiceClientCredentialFactory } from "botbuilder";

export const BOT_APP_ID = process.env.TEAMS_CHATBOT_CLIENT_ID!;
export const BOT_APP_PASSWORD = process.env.TEAMS_CHATBOT_CLIENT_SECRET!;

const authConfig = {
    MicrosoftAppId: BOT_APP_ID,
    MicrosoftAppPassword: BOT_APP_PASSWORD,
    MicrosoftAppType: 'MultiTenant',
    MicrosoftAppTenantId: '' // Empty for multi-tenant
}
const credentialFactory = new ConfigurationServiceClientCredentialFactory(authConfig);
const originalGetToken = credentialFactory.createCredentials.bind(credentialFactory);
credentialFactory.createCredentials = async function(...args) {
    console.log('Getting app credentials for:', args);
    const result = await originalGetToken(...args);
    console.log('Got credentials:', !!result);
    return result;
};
const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
    // The ConfigurationBotFrameworkAuthentication constructor expects an empty config object as the first parameter when you're using a credential factory 
    // - all the auth config should be in the credentialFactory, not duplicated in both places.
    { }, 
    credentialFactory
);

export const teamsAdapter = new BotFrameworkAdapter({
    appId: BOT_APP_ID,
    appPassword: BOT_APP_PASSWORD
});
teamsAdapter.onTurnError = async (context, error) => {
    console.error('ERROR in adapter.onTurnError:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if ((error as any).statusCode) {
        console.error('Status code:', (error as any).statusCode);
    }
    if ((error as any).body) {
        console.error('Error body:', (error as any).body);
    }
    
    // Try to send error message to user
    try {
        await context.sendActivity('Sorry, something went wrong.');
    } catch (sendError) {
        console.error('Could not send error message:', sendError);
    }
};