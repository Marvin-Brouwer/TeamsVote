# infra

Bicep for everything TVote needs in Azure and Entra ID. Not wired into a workflow: you run it by hand, once per setup.

| File | What it creates |
|---|---|
| [`main.bicep`](./main.bicep) | The resource group, and the modules below. Subscription scope. |
| [`modules/bot-identity.bicep`](./modules/bot-identity.bicep) | The user-assigned managed identity the bot is. No client secret. |
| [`modules/api.bicep`](./modules/api.bicep) | The App Service (F1, Linux, Node 22) the bot runs in, as that identity, with its settings and logging, and Contributor on it for the deploy identity. |
| [`modules/bot.bicep`](./modules/bot.bicep) | The Azure Bot (F0, managed identity) and its Teams channel, pointing at the App Service. |
| [`modules/web.bicep`](./modules/web.bicep) | The Static Web App (Free), and Contributor on it for the deploy identity. |
| [`modules/identities.bicep`](./modules/identities.bicep) | The `tvote-github-deploy` app registration and the federated credential that lets GitHub Actions deploy without a secret. |
| [`main.bicepparam`](./main.bicepparam) | The GitHub repository. |

```sh
az deployment sub create --name tvote --location westeurope --parameters infra/main.bicepparam
```

The deploy app registration uses the [Microsoft Graph Bicep extension](https://learn.microsoft.com/graph/templates/bicep/overview-bicep-templates-for-graph), configured in [`bicepconfig.json`](./bicepconfig.json), so whoever deploys needs Application Administrator (or Global Administrator) in Entra ID, as well as Owner on the subscription.

GitHub and Teams aren't in here. [`doc/setup.md`](../doc/setup.md) walks through all of it, in order, including this deployment and the move from the earlier Render setup.

`prefix` (default `tvote`) goes into every name, so a second deployment with another prefix gives a separate copy, for a test bot for example. The App Service name has to be unique across Azure.
