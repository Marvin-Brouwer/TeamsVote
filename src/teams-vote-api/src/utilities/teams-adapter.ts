import { CloudAdapter, ConfigurationBotFrameworkAuthentication } from "botbuilder";
import { AppCredentials, MicrosoftAppCredentials, PasswordServiceClientCredentialFactory } from "botframework-connector";

export const BOT_APP_ID = process.env.TEAMS_CHATBOT_CLIENT_ID!;
export const BOT_APP_PASSWORD = process.env.TEAMS_CHATBOT_CLIENT_SECRET!;

const authConfig = {
    MicrosoftAppId: BOT_APP_ID,
    MicrosoftAppPassword: BOT_APP_PASSWORD,
    MicrosoftAppType: 'MultiTenant',
    MicrosoftAppTenantId: '' // Empty for multi-tenant
}


// Custom credential factory that uses the Messaging Bot API
class MessagingBotCredentialFactory extends PasswordServiceClientCredentialFactory {

    constructor() {
        super(authConfig.MicrosoftAppId, authConfig.MicrosoftAppPassword);
    }

    async isValidAppId(appId: string): Promise<boolean> {
        return appId === BOT_APP_ID;
    }

    async isAuthenticationDisabled(): Promise<boolean> {
        return !BOT_APP_ID || !BOT_APP_PASSWORD;
    }

    async createCredentials(
        _appId: string,
        _audience: string,
        _loginEndpoint: string,
        validateAuthority: boolean
    ): Promise<AppCredentials> {
        // Override to use Messaging Bot API scope instead
        const credentials = new MicrosoftAppCredentials(
            authConfig.MicrosoftAppId,
            authConfig.MicrosoftAppPassword,
            undefined, // tenant
            'https://5a807f24-c9de-44ee-a3a7-329e88a00ffc/.default' // Messaging Bot API scope
        );

        const originalGetToken = credentials.getToken.bind(credentialFactory);
        credentials.getToken = async function(forceRefresh) {
            console.log('Getting token', forceRefresh ? 'forceRefresh' : '');
            const result = await originalGetToken(forceRefresh);
            console.log('Got credentials:', !!result);
            return result;
        };
        
        return credentials;
    }
}

const credentialFactory = new MessagingBotCredentialFactory();
const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
    // The ConfigurationBotFrameworkAuthentication constructor expects an empty config object as the first parameter when you're using a credential factory 
    // - all the auth config should be in the credentialFactory, not duplicated in both places.
    { }, 
    credentialFactory
);

export const teamsAdapter = new CloudAdapter(botFrameworkAuthentication);
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
