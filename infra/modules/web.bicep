// The Static Web App that serves the home, privacy and terms pages and the meeting tab, and the permission for GitHub to deploy to it.
// Deployments come from .github/workflows/web.yml, so the app isn't linked to a repository here.

param name string
param location string
@description('Object id of the service principal GitHub Actions deploys as.')
param deployPrincipalId string

resource web 'Microsoft.Web/staticSites@2024-04-01' = {
  name: name
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

// Contributor on this one resource only: the deploy workflow lists the deployment token, nothing else.
var contributorRoleId = 'b24988ac-6180-42a0-ab88-20f7382dd24c'

resource deployCanPublish 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: web
  name: guid(web.id, deployPrincipalId, contributorRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', contributorRoleId)
    principalId: deployPrincipalId
    principalType: 'ServicePrincipal'
  }
}

output name string = web.name
output url string = 'https://${web.properties.defaultHostname}'
