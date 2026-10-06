# TVote setup

Everything it takes to get TVote running. Azure and Entra ID come from one Bicep deployment in [`infra/`](../infra); GitHub and Teams are a few commands and fields.

Already running the earlier setup, with the API on Render? Skip to [Moving over from Render](#moving-over-from-render).

How the pieces fit:

```
Teams (meeting chat) ──(Bot Framework, authenticated by Microsoft)──▶ App Service: src/api (Express + Teams SDK)
  start card, start form, vote card                                    ├─ /api/messages   the bot, every click
                                                                       └─ /health
Teams (meeting tab) ──▶ Static Web App: src/web (rooted, static pages: home, privacy, terms, meeting tab)
```

Everything about a vote happens in cards that the bot posts and Teams draws. The web app only serves pages: it never talks to the API.

| Where | What | How |
|---|---|---|
| Azure | Resource group `rg-tvote` | Bicep |
| Azure | Managed identity `id-tvote-bot`: the bot's identity, no client secret | Bicep |
| Azure | App Service `tvote-api` (F1, Linux, Node 22), running as that identity | Bicep |
| Azure | Azure Bot `tvote-bot` (F0, managed identity) with the Teams channel | Bicep |
| Azure | Static Web App `tvote-web` (Free) | Bicep |
| Entra ID | `tvote-github-deploy` app registration, with a federated credential for GitHub Actions and Contributor on the App Service and the Static Web App | Bicep |
| GitHub | The `production` environment, secrets and variables | `gh` commands |
| Microsoft 365 | Teams licence, custom apps allowed, the app package | By hand |

## 0. What you need

- **One Entra ID tenant for everything:** the Azure subscription, the bot, and the Teams licence. A single-tenant bot tested from another tenant is a dead end before the app is in the store.
- **A work account in that tenant** (`you@yourtenant.onmicrosoft.com`), not a personal Microsoft account.
- **An Azure subscription in that tenant.** Pay-As-You-Go is fine: everything here is on a free tier. If the portal keeps showing "Welcome to Azure! Don't have a subscription?", there is none in this tenant yet: Subscriptions → + Add → Pay-As-You-Go. A new subscription can take a few minutes, and a sign out and back in, before the portal shows it.
- **Rights:** Owner on the subscription (the deployment assigns roles), and Application Administrator or Global Administrator in Entra ID (it creates the deploy app registration).
- **Tools:**
  - VS Code with the [Bicep extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-bicep) (`ms-azuretools.vscode-bicep`). VS Code suggests it when you open the repository, together with the other recommended extensions.
  - The [GitHub CLI](https://cli.github.com) (`gh auth login`).
  - The [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) only for [Logs](#logs) and [Moving over from Render](#moving-over-from-render); Azure Cloud Shell has it.

## 1. Azure and Entra ID (Bicep)

With the Bicep extension's Deployment Pane:

1. Open `infra/main.bicepparam` and check the GitHub repository in it.
2. Open the Deployment Pane: the cloud icon at the top right of the editor, or right-click the file → **Show Deployment Pane**.
3. **Pick Scope:**
   - sign in with your work account, when VS Code asks;
   - pick the subscription;
   - pick **West Europe** as the location. It's where Azure keeps the deployment's record; the resources' own region is set in the template.

   No subscription in the list? VS Code is signed in with another account, or the tenant needs a fresh sign-in: Accounts (bottom left) → sign out, and pick the scope again.
4. The parameters come from the file. **What-If** shows what would change, without changing anything. Then **Deploy**.
5. When it's done, the pane shows the **Outputs**: the values for the rest of this guide. They are `tenantId`, `subscriptionId`, `resourceGroupName`, `botClientId`, `deployClientId`, `apiAppName`, `apiUrl`, `staticWebAppName` and `webUrl`. None of them are secret. They stay in the portal too, under the subscription → Deployments.

Running it again is safe: it updates what's there instead of creating copies.

Without VS Code, the Azure CLI does the same:

```sh
az login --tenant <your tenant>.onmicrosoft.com
az account set --subscription <subscription id>
az deployment sub create --name tvote --location westeurope --parameters infra/main.bicepparam --query properties.outputs
```

Things the template already deals with:

- **The App Service name is global.** `tvote-api` becomes `tvote-api.azurewebsites.net`. If someone else has it, deploy with another `prefix`.
- **The bot is a managed identity.** The App Service runs as `id-tvote-bot`, and the Teams SDK signs in as it because `CLIENT_ID` and `MANAGED_IDENTITY_CLIENT_ID` are both its client id. There's no client secret, so nothing expires.
- **The bot runs in the *global* region.** The Europe region of the Bot Service wasn't accepting new customers. That only changes where Microsoft relays Teams messages; the votes stay in the App Service in West Europe.
- **F1 sleeps.** After about 20 minutes without traffic the App Service sleeps, and the first click after that can fail once while it wakes up (seconds). For about €12 a month, B1 with Always On removes that: change `F1` in `infra/modules/api.bicep` and set `alwaysOn: true`.
- **The GitHub federated credential uses the name-based subject**, `repo:Marvin-Brouwer/TeamsVote:environment:production`. That's what GitHub sends for repositories created before 15 July 2026. Newer repositories send the immutable format with numeric ids instead. If a deploy fails at "Azure login", the error shows the subject GitHub sent. Note that the portal's "GitHub Actions" credential form always writes the immutable format; use "Other issuer" there.

## 2. GitHub

From a clone of the repository, with `gh` signed in:

```sh
gh api --method PUT repos/{owner}/{repo}/environments/production

gh secret set AZURE_CLIENT_ID --body <deployClientId>
gh secret set AZURE_TENANT_ID --body <tenantId>
gh secret set AZURE_SUBSCRIPTION_ID --body <subscriptionId>

gh variable set AZURE_RESOURCE_GROUP --body <resourceGroupName>
gh variable set AZURE_API_APP_NAME --body <apiAppName>
gh variable set AZURE_STATIC_WEBAPP_NAME --body <staticWebAppName>
gh variable set WEB_URL --body <webUrl>
gh variable set BOT_CLIENT_ID --body <botClientId>
gh variable set TEAMS_APP_ID --body <a new GUID>
```

- **Repository variables, not environment variables.** The build jobs don't run in the `production` environment, so they can't see variables that only live there. The commands above (without `--env`) make repository variables.
- `AZURE_CLIENT_ID` is the *deploy* app's id. `BOT_CLIENT_ID` is the bot's managed identity.
- `TEAMS_APP_ID` is the Teams app's own identity: generate it once (`uuidgen`, or `[guid]::NewGuid()` in PowerShell) and never change it. A new id is a different app to Teams.

## 3. Deploy

Merge to `main`, or run the workflows by hand under Actions:

- **Publish API** lints, tests and builds `src/api`, and uploads it to the App Service. Check `<apiUrl>/health` afterwards.
- **Publish web app** builds `src/web` and uploads it to the Static Web App. Check `<webUrl>`.
- **Teams app package** builds `tvote-1.0.<n>.zip` with your values filled in, as a run artifact.

## 4. Microsoft 365 and Teams

1. **A licence with Teams** for your work account, in the same tenant. Teams Essentials or Microsoft 365 Business Basic, monthly. To test voting you need a second account in the meeting too.
2. **Allow custom apps**, in the Teams admin center (admin.teams.microsoft.com):
   - Teams apps → Setup policies → Global (Org-wide default) → **Upload custom apps: On**.
   - Teams apps → Manage apps → Actions → Org-wide app settings → **Let users interact with custom apps: On**.

   These can take a few hours to apply.
3. **Upload the package:** Teams admin center → Teams apps → Manage apps → **Upload new app**, and pick the zip from step 3. For a new version, open TVote there and upload the new zip as an update.

## 5. Using it in a meeting

1. **Add TVote to the meeting, once:** open the meeting → **Apps** (during the call) or the **+** at the top of the meeting chat → TVote → **Save**. TVote joins the meeting chat and posts its start card. The meeting gets a TVote tab with a short how-to.
2. **Start an estimate:** **Start estimate** on that card → fill in the topic (a Jira key or link) and the cards → **Start**. The vote card appears in the chat. Lost the start card? Send `@TVote` anything, and it posts a new one.
3. **Vote:** everyone clicks their value on the vote card. Everyone sees who voted, not what; your own vote is highlighted on your own view.
4. **Show votes, re-vote:** whoever started it sees an extra button on their view of the card. **Show votes** shows who voted what and the estimate; that's the result. **Re-vote** clears the votes for another round.

TVote doesn't work in a chat between two people: Teams doesn't allow bots there.

## 6. Smoke test

In a scheduled meeting with two accounts:

- Add TVote through **Apps**: the start card appears in the chat.
- **Start estimate** → topic → **Start**: the vote card appears.
- Vote from both accounts: both see "2 voted", each with their own vote highlighted.
- The starter: **Show votes**, **Re-vote**, vote again, **Show votes**: everyone sees the votes and the estimate; only the starter sees **Re-vote**.
- Restart the App Service (or wait for it to sleep), then open the chat again: the card still shows the result, without buttons.
- Switch Teams to dark, and to high contrast.

## Logs

The API logs to the console, which the App Service keeps for three days:

```sh
az webapp log tail --resource-group rg-tvote --name tvote-api
```

Or in the portal: the App Service → **Log stream**. `LOG_LEVEL=info` (an app setting) adds a line per request and per Teams activity, without names or ids. `warn` is quieter, for when everything works.

## Moving over from Render

For the setup that was clicked together in the portal earlier, with the API on Render, a bot app registration with a client secret, and the dialogs. Run this in Azure Cloud Shell (Bash). Do steps 1 to 4 **before** merging the redesign, so the first deploy and the new Teams package find everything in place.

```sh
RG=rg-tvote
LOCATION=westeurope
API=tvote-api        # becomes tvote-api.azurewebsites.net; pick another name if it's taken
TENANT_ID=$(az account show --query tenantId --output tsv)
```

**1. The bot's managed identity**

```sh
az identity create --resource-group $RG --name id-tvote-bot --location $LOCATION
BOT_CLIENT_ID=$(az identity show --resource-group $RG --name id-tvote-bot --query clientId --output tsv)
BOT_IDENTITY_ID=$(az identity show --resource-group $RG --name id-tvote-bot --query id --output tsv)
```

**2. The App Service**

```sh
az appservice plan create --resource-group $RG --name $API-plan --location $LOCATION --is-linux --sku F1
az webapp create --resource-group $RG --name $API --plan $API-plan --runtime "NODE:22-lts" --assign-identity $BOT_IDENTITY_ID
az webapp update --resource-group $RG --name $API --https-only true
az webapp config set --resource-group $RG --name $API --startup-file "node dist/server.mjs" --ftps-state Disabled --min-tls-version 1.2
az webapp config appsettings set --resource-group $RG --name $API --settings \
  CLIENT_ID=$BOT_CLIENT_ID MANAGED_IDENTITY_CLIENT_ID=$BOT_CLIENT_ID TENANT_ID=$TENANT_ID \
  LOG_LEVEL=info SCM_DO_BUILD_DURING_DEPLOYMENT=false
az webapp log config --resource-group $RG --name $API --application-logging filesystem --docker-container-logging filesystem --level information

# Let GitHub deploy to it: the deploy app is the one in the AZURE_CLIENT_ID secret.
DEPLOY_PRINCIPAL=$(az ad sp show --id <the deploy app's client id> --query id --output tsv)
az role assignment create --assignee-object-id $DEPLOY_PRINCIPAL --assignee-principal-type ServicePrincipal \
  --role Contributor --scope $(az webapp show --resource-group $RG --name $API --query id --output tsv)
```

**3. The Azure Bot, again, as a managed identity.** An Azure Bot's type can't be changed, so the old one goes. Check its name first with `az bot list --resource-group $RG --output table`.

```sh
az bot delete --resource-group $RG --name tvote-bot
az bot create --resource-group $RG --name tvote-bot --sku F0 \
  --app-type UserAssignedMSI --appid $BOT_CLIENT_ID --msi-resource-id $BOT_IDENTITY_ID --tenant-id $TENANT_ID \
  --endpoint https://$API.azurewebsites.net/api/messages
az bot msteams create --resource-group $RG --name tvote-bot
```

**4. GitHub** (from a clone, with `gh`), as repository variables:

```sh
gh variable set BOT_CLIENT_ID --body <the BOT_CLIENT_ID from step 1>
gh variable set AZURE_API_APP_NAME --body tvote-api
gh variable set AZURE_RESOURCE_GROUP --body rg-tvote
```

**5. Merge the redesign.** Publish API deploys to the App Service; check `https://tvote-api.azurewebsites.net/health`. Teams app package builds a new zip, with the new bot id: upload it as an update to TVote (step 4.3 above). The Teams app id stays the same.

**6. Once a vote works, clean up the old setup:**

- Render: delete the service.
- Entra ID → App registrations: delete **TVote Bot** (the old bot identity, with its client secret).
- GitHub: delete the secret `RENDER_API_KEY`, the variables `RENDER_SERVICE_ID` and `API_URL`, and the `render-api` environment.

## Local development

Without Teams there are no cards, so the voting itself can only be tried in Teams. What you can do locally:

```sh
pnpm install
pnpm test         # the session rules, the cards' JSON and every click, see src/api/tests
pnpm lint
pnpm typecheck
pnpm dev          # the web pages on :5173, and the API on :3978 (which refuses Teams traffic without the bot's identity)
```

To look at a card, paste its JSON into the [Adaptive Cards Designer](https://adaptivecards.microsoft.com/designer) with the host set to Microsoft Teams, in light and dark. A test can print it: `console.log(JSON.stringify(voteCard(session, user)))`.

## Later: AppSource

Out of scope here, but for the record: a Partner Center account with a verified publisher, the zip from step 3, and the privacy (`webUrl/privacy/`), terms (`webUrl/terms/`) and website (`webUrl/`) URLs, which the web app serves from the documents in this folder.
