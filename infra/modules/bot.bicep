// The Azure Bot: ties the bot's app registration to the Teams channel and tells Microsoft where the bot listens.
// It holds configuration only, no conversations or votes.

param name string
param botClientId string
param messagingEndpoint string

resource bot 'Microsoft.BotService/botServices@2022-09-15' = {
  name: name
  // Global rather than the Europe region: Europe wasn't taking new customers when this was set up.
  // It only affects where Microsoft's Bot Framework Service relays messages, the votes stay on Render.
  location: 'global'
  kind: 'azurebot'
  sku: {
    // The Teams channel is free on F0.
    name: 'F0'
  }
  properties: {
    displayName: 'TVote'
    endpoint: messagingEndpoint
    msaAppId: botClientId
    msaAppTenantId: tenant().tenantId
    msaAppType: 'SingleTenant'
  }
}

resource teamsChannel 'Microsoft.BotService/botServices/channels@2022-09-15' = {
  parent: bot
  name: 'MsTeamsChannel'
  location: 'global'
  properties: {
    channelName: 'MsTeamsChannel'
    properties: {
      isEnabled: true
      acceptedTerms: true
      deploymentEnvironment: 'CommercialDeployment'
    }
  }
}
