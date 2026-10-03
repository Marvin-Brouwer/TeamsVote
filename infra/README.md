# infra

Bicep for everything TVote needs in Azure and Entra ID. Not wired into a workflow: you run it by hand, once per setup.

| File | What it creates |
|---|---|
| [`main.bicep`](./main.bicep) | The resource group, and the three modules below. Subscription scope. |
| [`modules/identities.bicep`](./modules/identities.bicep) | The `TVote Bot` and `tvote-github-deploy` app registrations, their service principals, and the federated credential that lets GitHub Actions deploy without a secret. |
| [`modules/bot.bicep`](./modules/bot.bicep) | The Azure Bot (F0, single tenant) and its Teams channel. |
| [`modules/web.bicep`](./modules/web.bicep) | The Static Web App (Free), and Contributor on it for the deploy identity. |
| [`main.bicepparam`](./main.bicepparam) | The repository and the bot's messaging endpoint. |

```sh
az deployment sub create --name tvote --location westeurope --parameters infra/main.bicepparam
```

The app registrations use the [Microsoft Graph Bicep extension](https://learn.microsoft.com/graph/templates/bicep/overview-bicep-templates-for-graph), configured in [`bicepconfig.json`](./bicepconfig.json), so whoever deploys needs Application Administrator (or Global Administrator) in Entra ID, as well as Owner on the subscription.

The bot's client secret, Render, GitHub and Teams aren't in here. [`doc/setup.md`](../doc/setup.md) walks through all of it, in order, including this deployment.

`prefix` (default `tvote`) goes into every name, so a second deployment with another prefix gives a separate copy, for a test bot for example.
