// The identity GitHub Actions deploys as, trusted through a federated credential, so no secret at all.
// The bot's own identity is a managed identity, see bot-identity.bicep.
extension microsoftGraphV1

param prefix string
param githubRepository string
param githubEnvironment string

resource deployApp 'Microsoft.Graph/applications@v1.0' = {
  // `uniqueName` is what makes a rerun update this registration instead of creating another one.
  uniqueName: '${prefix}-github-deploy'
  displayName: '${prefix}-github-deploy'
  signInAudience: 'AzureADMyOrg'
}

resource deployServicePrincipal 'Microsoft.Graph/servicePrincipals@v1.0' = {
  appId: deployApp.appId
}

// The subject is GitHub's name-based format. Repositories created or renamed after 15 July 2026 send
// the immutable format (`repo:<owner>@<owner id>/<repo>@<repo id>:...`) instead; use that here for those.
// The portal's "GitHub Actions" form always writes the immutable format, which is why this one has to be explicit.
resource githubCredential 'Microsoft.Graph/applications/federatedIdentityCredentials@v1.0' = {
  name: '${deployApp.uniqueName}/github-${githubEnvironment}'
  audiences: ['api://AzureADTokenExchange']
  issuer: 'https://token.actions.githubusercontent.com'
  subject: 'repo:${githubRepository}:environment:${githubEnvironment}'
  description: 'GitHub Actions deploying TVote to its App Service'
}

output deployClientId string = deployApp.appId
output deployPrincipalId string = deployServicePrincipal.id
