// Everything TVote needs in Azure and Entra ID, from scratch: the two app registrations,
// the Azure Bot with its Teams channel, and the Static Web App with the deploy permission.
// What can't live here (the bot's client secret, Render, GitHub settings, Teams) is in README.md.
targetScope = 'subscription'

@description('Region for the resource group.')
param location string = 'westeurope'

@description('Region for the Static Web App. Only a handful of regions host them, the files are served globally either way.')
@allowed(['westeurope', 'centralus', 'eastus2', 'westus2', 'eastasia'])
param staticWebAppLocation string = 'westeurope'

@description('Owner and repository on GitHub, like "Marvin-Brouwer/TeamsVote". The deploy workflow signs in as this repository.')
param githubRepository string

@description('The GitHub environment the web deploy job runs in. Must match `environment.name` in .github/workflows/web.yml.')
param githubEnvironment string = 'production'

@description('Where the bot listens: the API on Render, plus /api/messages.')
param messagingEndpoint string

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

module bot 'modules/bot.bicep' = {
  scope: group
  params: {
    name: '${prefix}-bot'
    botClientId: identities.outputs.botClientId
    messagingEndpoint: messagingEndpoint
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

// Everything README.md asks you to copy into Render and GitHub.
output tenantId string = tenant().tenantId
output subscriptionId string = subscription().subscriptionId
output resourceGroupName string = group.name
output botClientId string = identities.outputs.botClientId
output deployClientId string = identities.outputs.deployClientId
output staticWebAppName string = web.outputs.name
output webUrl string = web.outputs.url
