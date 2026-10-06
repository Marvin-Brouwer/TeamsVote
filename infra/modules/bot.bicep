// The Azure Bot: ties the bot's identity to the Teams channel and tells Microsoft where the bot listens.
// It holds configuration only, no conversations or votes. Its type can't be changed after it's created.

param name string
@description('Client id of the bot\'s user-assigned managed identity. This is the bot id the Teams manifest uses.')
param identityClientId string
@description('Resource id of that managed identity.')
param identityResourceId string
param messagingEndpoint string

resource bot 'Microsoft.BotService/botServices@2022-09-15' = {
  name: name
  // Global rather than the Europe region: Europe wasn't taking new customers when this was set up.
  // It only affects where Microsoft's Bot Framework Service relays messages, the votes stay in the App Service.
  location: 'global'
  kind: 'azurebot'
  sku: {
    // The Teams channel is free on F0.
    name: 'F0'
  }
  properties: {
    displayName: 'TVote'
    endpoint: messagingEndpoint
    msaAppType: 'UserAssignedMSI'
    msaAppId: identityClientId
    msaAppMSIResourceId: identityResourceId
    msaAppTenantId: tenant().tenantId
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
