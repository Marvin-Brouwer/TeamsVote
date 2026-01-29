import { CloudAdapter, getAuthConfigWithDefaults } from "@microsoft/agents-hosting";

export const TENANT = process.env.TEAMS_PLUGIN_TENANT_ID!;
export const BOT_APP_ID = process.env.TEAMS_CHATBOT_CLIENT_ID!;
export const BOT_APP_PASSWORD = process.env.TEAMS_CHATBOT_CLIENT_SECRET!;

const authConfig = getAuthConfigWithDefaults({
    tenantId: TENANT, 
    clientId: BOT_APP_ID, 
    clientSecret: BOT_APP_PASSWORD,
})
const cloudAdapter = new CloudAdapter({ 
    ...authConfig,
    tenantId: TENANT, 
    clientId: BOT_APP_ID, 
    clientSecret: BOT_APP_PASSWORD,
})

export const teamsAdapter = cloudAdapter