// Everything TVote needs in Azure and Entra ID, from scratch: the bot's managed identity, the App Service it runs in,
// the Azure Bot with its Teams channel, the Static Web App, and the identity GitHub Actions deploys both with.
// What can't live here (GitHub settings, Teams) is in README.md.
targetScope = 'subscription'

@description('Region for the resource group, the API and the bot\'s identity.')
param location string = 'westeurope'

@description('Region for the Static Web App. Only a handful of regions host them, the files are served globally either way.')
@allowed(['westeurope', 'centralus', 'eastus2', 'westus2', 'eastasia'])
param staticWebAppLocation string = 'westeurope'

@description('Owner and repository on GitHub, like "Marvin-Brouwer/TeamsVote". The deploy workflows sign in as this repository.')
param githubRepository string

@description('The GitHub environment the deploy jobs run in. Must match `environment.name` in .github/workflows/api.yml and web.yml.')
param githubEnvironment string = 'production'

@description('How much the API logs. `info` adds a line per request and per Teams activity, without names or ids.')
@allowed(['error', 'warn', 'info', 'debug'])
param logLevel string = 'warn'

@description('Prefix for every name. Change it to run a second, separate copy, like a test setup.')
param prefix string = 'tvote'

resource group 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: 'rg-${prefix}'
  location: location
}

module identities 'modules/identities.bicep' = {
  scope: group
  params: {
    prefix: prefix
    githubRepository: githubRepository
    githubEnvironment: githubEnvironment
  }
}

module botIdentity 'modules/bot-identity.bicep' = {
  scope: group
  params: {
    name: 'id-${prefix}-bot'
    location: location
  }
}

module api 'modules/api.bicep' = {
  scope: group
  params: {
    name: '${prefix}-api'
    location: location
    identityResourceId: botIdentity.outputs.id
    identityClientId: botIdentity.outputs.clientId
    logLevel: logLevel
    deployPrincipalId: identities.outputs.deployPrincipalId
  }
}

module bot 'modules/bot.bicep' = {
  scope: group
  params: {
    name: '${prefix}-bot'
    identityClientId: botIdentity.outputs.clientId
    identityResourceId: botIdentity.outputs.id
    messagingEndpoint: '${api.outputs.url}/api/messages'
  }
}

module web 'modules/web.bicep' = {
  scope: group
  params: {
    name: '${prefix}-web'
    location: staticWebAppLocation
    deployPrincipalId: identities.outputs.deployPrincipalId
  }
}

// Everything README.md asks you to copy into GitHub.
output tenantId string = tenant().tenantId
output subscriptionId string = subscription().subscriptionId
output resourceGroupName string = group.name
output botClientId string = botIdentity.outputs.clientId
output deployClientId string = identities.outputs.deployClientId
output apiAppName string = api.outputs.name
output apiUrl string = api.outputs.url
output staticWebAppName string = web.outputs.name
output webUrl string = web.outputs.url
