// The API and bot: one Node app on App Service's free tier, running as the bot's managed identity.
// Votes live in this one instance's memory, so it must never scale out.

param name string
param location string
@description('Resource id of the bot\'s user-assigned managed identity.')
param identityResourceId string
@description('Client id of that identity. The Teams SDK signs in as it.')
param identityClientId string
@description('`warn` keeps the log quiet. `info` also logs each request and each Teams activity, without names or ids.')
@allowed(['error', 'warn', 'info', 'debug'])
param logLevel string
@description('Object id of the service principal GitHub Actions deploys as.')
param deployPrincipalId string

resource plan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: '${name}-plan'
  location: location
  kind: 'linux'
  sku: {
    // Free: sleeps after about 20 minutes without traffic, and wakes in seconds. B1 adds Always On.
    name: 'F1'
    tier: 'Free'
  }
  properties: {
    reserved: true
  }
}

resource api 'Microsoft.Web/sites@2024-04-01' = {
  name: name
  location: location
  kind: 'app,linux'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${identityResourceId}': {}
    }
  }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      // The deploy workflow uploads the built app with its production node_modules, nothing to build here.
      appCommandLine: 'node dist/server.mjs'
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      healthCheckPath: '/health'
      appSettings: [
        // Same client id twice: that's how the Teams SDK knows to sign in as this user-assigned identity.
        { name: 'CLIENT_ID', value: identityClientId }
        { name: 'MANAGED_IDENTITY_CLIENT_ID', value: identityClientId }
        { name: 'TENANT_ID', value: tenant().tenantId }
        { name: 'LOG_LEVEL', value: logLevel }
        { name: 'SCM_DO_BUILD_DURING_DEPLOYMENT', value: 'false' }
      ]
    }
  }
}

// What the app writes to the console, in the portal's Log stream and `az webapp log tail`. Kept three days.
resource logs 'Microsoft.Web/sites/config@2024-04-01' = {
  parent: api
  name: 'logs'
  properties: {
    applicationLogs: {
      fileSystem: {
        level: 'Information'
      }
    }
    httpLogs: {
      fileSystem: {
        enabled: true
        retentionInDays: 3
        retentionInMb: 35
      }
    }
  }
}

// Contributor on this one app only, so the deploy workflow can upload to it.
var contributorRoleId = 'b24988ac-6180-42a0-ab88-20f7382dd24c'

resource deployCanPublish 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: api
  name: guid(api.id, deployPrincipalId, contributorRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', contributorRoleId)
    principalId: deployPrincipalId
    principalType: 'ServicePrincipal'
  }
}

output name string = api.name
output url string = 'https://${api.properties.defaultHostName}'
