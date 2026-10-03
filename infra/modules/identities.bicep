// The two app registrations, both single tenant:
// - the bot's identity, which the API on Render signs in as (with a client secret, see README.md)
// - the identity GitHub Actions deploys the web app as, trusted through a federated credential, so no secret at all
extension microsoftGraphV1

param prefix string
param githubRepository string
param githubEnvironment string

resource botApp 'Microsoft.Graph/applications@v1.0' = {
  // `uniqueName` is what makes a rerun update this registration instead of creating another one.
  uniqueName: '${prefix}-bot'
  displayName: 'TVote Bot'
  signInAudience: 'AzureADMyOrg'
}

resource botServicePrincipal 'Microsoft.Graph/servicePrincipals@v1.0' = {
  appId: botApp.appId
}

resource deployApp 'Microsoft.Graph/applications@v1.0' = {
  uniqueName: '${prefix}-github-deploy'
  displayName: '${prefix}-github-deploy'
  signInAudience: 'AzureADMyOrg'
}

resource deployServicePrincipal 'Microsoft.Graph/servicePrincipals@v1.0' = {
  appId: deployApp.appId
}

// The subject is GitHub's name-based format. Repositories created or renamed after 15 July 2026 send
// the immutable format (`repo:<owner>@<owner id>/<repo>@<repo id>:...`) instead; use that here for those.
resource githubCredential 'Microsoft.Graph/applications/federatedIdentityCredentials@v1.0' = {
  name: '${deployApp.uniqueName}/github-${githubEnvironment}'
  audiences: ['api://AzureADTokenExchange']
  issuer: 'https://token.actions.githubusercontent.com'
  subject: 'repo:${githubRepository}:environment:${githubEnvironment}'
  description: 'GitHub Actions deploying the web app to the Static Web App'
}

output botClientId string = botApp.appId
output deployClientId string = deployApp.appId
output deployPrincipalId string = deployServicePrincipal.id
