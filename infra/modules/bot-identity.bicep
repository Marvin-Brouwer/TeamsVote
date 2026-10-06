// The bot's identity: a user-assigned managed identity instead of an app registration with a client secret.
// The App Service runs as it, so nothing has to be stored, rotated or remembered before it expires.

param name string
param location string

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: name
  location: location
}

output id string = identity.id
output clientId string = identity.properties.clientId
