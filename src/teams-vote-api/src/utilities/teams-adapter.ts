import { CloudAdapter, getAuthConfigWithDefaults } from "@microsoft/agents-hosting";

export const TENANT = process.env.TEAMS_PLUGIN_TENANT_ID!;
export const APP_ID = process.env.TEAMS_CHATBOT_CLIENT_ID!;
export const APP_PASSWORD = process.env.TEAMS_CHATBOT_CLIENT_SECRET!;

const authConfig = getAuthConfigWithDefaults({
    tenantId: TENANT, 
    clientId: APP_ID, 
    clientSecret: APP_PASSWORD,
})
const cloudAdapter = new CloudAdapter({ 
    ...authConfig,
    tenantId: TENANT, 
    clientId: APP_ID, 
    clientSecret: APP_PASSWORD,
})

export const teamsAdapter = cloudAdapter