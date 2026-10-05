# TVote setup, from scratch

Everything it takes to get TVote running, in order. Azure and Entra ID come from one Bicep deployment in [`infra/`](../infra); the rest (a client secret, Render, GitHub, Teams) are commands or a few fields to fill in.

> [!WARNING]
> This is for a fresh setup. Don't run the Bicep deployment against a setup that was clicked together in the portal with the same names: it would create new app registrations next to the existing ones and point the existing bot at the new one, and the client secret on Render would stop working. Use another `prefix` (see `infra/main.bicep`) or remove the old resources first.

How the pieces fit:

```
Teams client ──(Bot Framework, authenticated by Microsoft)──▶ Render: src/api (Express + Teams SDK)
     │                                                         ├─ /api/messages   the bot
     │ dialogs                                                 ├─ /api/sessions/* votes, live state
     ▼                                                         └─ /health
Azure Static Web App: src/web (rooted, static files) ──fetch──▶ Render
```

| Where | What | How |
|---|---|---|
| Entra ID | `TVote Bot` app registration (single tenant) and its service principal | Bicep |
| Entra ID | `tvote-github-deploy` app registration with a federated credential for GitHub Actions | Bicep |
| Azure | Resource group `rg-tvote`, Azure Bot `tvote-bot` (F0) with the Teams channel | Bicep |
| Azure | Static Web App `tvote-web` (Free), Contributor on it for `tvote-github-deploy` | Bicep |
| Entra ID | The bot's client secret | One `az` command (Bicep can't create secrets, on purpose) |
| Render | The API service and its environment | By hand |
| GitHub | Environments, secrets and variables | `gh` commands |
| Microsoft 365 | Teams licence, custom app upload, the app package | By hand |

## 0. What you need

- **One Entra ID tenant for everything:** the Azure subscription, the bot, and later the Teams licence. A single-tenant bot tested from a different tenant than its own is a known dead end before the app is in the store.
- **A work account in that tenant** (`you@yourtenant.onmicrosoft.com`), not a personal Microsoft account, so you can buy Microsoft 365 for it later.
- **An Azure subscription in that tenant.** Pay-As-You-Go is fine: everything here is on a free tier. If the portal keeps showing "Welcome to Azure! Don't have a subscription?", there is none in this tenant yet: Subscriptions → + Add → Pay-As-You-Go. A new subscription can take a few minutes, and a sign out and back in, before the portal shows it.
- **Rights:** Owner on the subscription (the deployment assigns a role), and Application Administrator or Global Administrator in Entra ID (it creates app registrations).
- **Tools:** [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) with Bicep (`az bicep install`), and the [GitHub CLI](https://cli.github.com) (`gh auth login`).
- **Render:** an account, and the URL your service will have, like `https://teamsvote.onrender.com`.

## 1. Azure and Entra ID (Bicep)

Check `infra/main.bicepparam`: the GitHub repository, and the messaging endpoint (your Render URL plus `/api/messages`). Then:

```sh
az login --tenant <your tenant>.onmicrosoft.com
az account set --subscription <subscription id>

az deployment sub create --name tvote --location westeurope --parameters infra/main.bicepparam
az deployment sub show --name tvote --query properties.outputs --output json
```

The outputs are the values for the rest of this guide: `tenantId`, `subscriptionId`, `resourceGroupName`, `botClientId`, `deployClientId`, `staticWebAppName` and `webUrl`. None of them are secret. Keep them at hand.

Running it again is safe: it updates what's there instead of creating copies.

Things the template already deals with, so you don't trip over them:

- **The bot runs in the *global* region.** The Europe region of the Bot Service wasn't accepting new customers. That only changes where Microsoft relays the Teams messages; the votes stay on Render in Frankfurt.
- **The Static Web App region** defaults to West Europe. If Azure refuses it, set `staticWebAppLocation` to `centralus` or `eastus2`: the files are served from Microsoft's global network either way.
- **The GitHub federated credential uses the name-based subject**, `repo:Marvin-Brouwer/TeamsVote:environment:production`. That's what GitHub sends for repositories created before 15 July 2026. A repository created or renamed after that date sends the immutable format with numeric ids instead (`repo:<owner>@<owner id>/<repo>@<repo id>:…`); change the subject in `infra/modules/identities.bicep` to match. If the first web deploy fails at "Azure login", the error shows the subject GitHub sent.

## 2. The bot's client secret

```sh
az ad app credential reset --id <botClientId> --display-name render --years 2 --append --query password --output tsv
az ad app credential list --id <botClientId> --query "[].{name: displayName, expires: endDateTime}" --output table
```

The first prints the secret once: it goes straight into Render (next step) and nowhere else. The second shows when it expires: put that date in your calendar. When the secret lapses, the bot can no longer post or update cards, and you run the first command again.

## 3. Render

Service settings (create a new Web Service from the repository, or check an existing one):

| Setting | Value |
|---|---|
| Region | Frankfurt (can't be changed later) |
| Branch | `main` |
| Build command | `pnpm install && pnpm deploy:build` |
| Start command | `pnpm deploy:start` |
| Health check path | `/health` |
| Auto-Deploy | Off: the *Publish API* workflow deploys, after lint, typecheck and tests pass |

Environment variables:

| Key | Value |
|---|---|
| `CLIENT_ID` | `botClientId` |
| `CLIENT_SECRET` | the secret from step 2 |
| `TENANT_ID` | `tenantId` |
| `WEB_URL` | `webUrl` |
| `SESSION_TOKEN_SECRET` | a long random string: `openssl rand -base64 48`, or in PowerShell 7 `[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))` |
| `NODE_VERSION` | `22` |
| `LOG_LEVEL` | optional, `warn` by default. `info` also logs each request (method, path, status, time; never names or ids) |

Don't set `NODE_ENV=production`: pnpm would then skip the dev dependencies the build needs. When changing variables on an existing service, choose **Save only**, so Render doesn't rebuild whatever is on `main` with variables it doesn't expect.

**→ note** the service id (`srv-…`, in the dashboard URL) and create an API key under Account settings → API keys.

The free tier sleeps after about 15 minutes without traffic, and waking takes up to a minute. Teams doesn't wait that long: the first **Start estimate** or **Vote** click after a quiet spell can fail with "can't reach the app", and clicking again works. Pinging the service to keep it awake goes against Render's policy, so that's the price of the free tier.

## 4. GitHub

From a clone of the repository, with `gh` signed in:

```sh
gh api --method PUT repos/{owner}/{repo}/environments/production
gh api --method PUT repos/{owner}/{repo}/environments/render-api

gh secret set AZURE_CLIENT_ID --body <deployClientId>
gh secret set AZURE_TENANT_ID --body <tenantId>
gh secret set AZURE_SUBSCRIPTION_ID --body <subscriptionId>
gh secret set RENDER_API_KEY            # prompts for the value

gh variable set AZURE_STATIC_WEBAPP_NAME --body <staticWebAppName>
gh variable set AZURE_RESOURCE_GROUP --body <resourceGroupName>
gh variable set WEB_URL --body <webUrl>
gh variable set API_URL --body https://teamsvote.onrender.com
gh variable set RENDER_SERVICE_ID --body <srv-…>
gh variable set BOT_CLIENT_ID --body <botClientId>
gh variable set TEAMS_APP_ID --body <a new GUID>
```

`AZURE_CLIENT_ID` is the *deploy* app's id, not the bot's. `TEAMS_APP_ID` is the identity of the Teams app itself, separate from the bot: generate it once (`uuidgen`, or `[guid]::NewGuid()` in PowerShell) and never change it, because a new id is a different app to Teams and to AppSource.

## 5. Deploy

Merge to `main` (or run the workflows by hand under Actions):

- **Publish web app** builds `src/web` and uploads it to the Static Web App. Check `webUrl` and `webUrl/teams/start/` afterwards.
- **Publish API** checks `src/api` and has Render deploy it. Check `<render url>/health`.
- **Teams app package** builds the zip with your values filled in, as a run artifact.

## 6. Microsoft 365 and Teams

1. **A licence with Teams** for your work account, in the same tenant: Microsoft 365 Business Basic on monthly billing does it. The free personal Teams can't run custom apps. To test voting you need a second account too: a second licence, or a guest.
2. **Allow custom apps**, in the Teams admin center:
   - Teams apps → Setup policies → Global (Org-wide default) → **Upload custom apps: On**.
   - Teams apps → Manage apps → Actions → Org-wide app settings → **Let users interact with custom apps: On**.

   These can take a few hours to apply, so do them on day one.
3. **Upload the package:** Teams → Apps → Manage your apps → Upload an app → **Upload a custom app**, and pick the zip from step 5. The Teams Developer Portal (Apps → Import app) works too, and validates the package.
4. **Adding TVote where you vote.** The bot can only post cards in conversations it's part of:
   - **Group chats and channels:** nothing to do up front. The first time someone opens **Start estimate** there, the dialog shows **Add TVote**: one click adds the bot, and the start dialog opens.
   - **Meetings:** add TVote to the meeting first, through **Apps** in the meeting (or **+** at the top of the meeting chat). That adds the bot to the meeting chat, and puts a short how-to in the side panel. In our tests, the one-click **Add TVote** didn't install anything in a meeting chat.
   - **Chats between two people:** not possible, Teams doesn't allow bots there. **Start estimate** says so.

## 7. Smoke test

- In a chat without TVote, below the message box: **+** (or **…**) → TVote → **Start estimate** → **Add TVote**. The start dialog opens: fill in a topic, Start. A card appears and your vote dialog opens.
- In the same chat, send `@TVote help`, then `@TVote PROJ-1`. A vote card appears.
- In a meeting: **Apps** → TVote → **Save**. The side panel shows the how-to. Then in the meeting chat: **+** → TVote → **Start estimate**, and the start dialog opens straight away.
- Vote from two accounts, **Show votes**, **Re-vote**, vote again, **Accept**. The vote card turns into the result, and both dialogs close.
- Switch Teams to dark, and to high contrast, with a dialog open. It should follow along.

When something fails, the Render logs and whatever Teams shows are what's needed to find out why.

## Later: AppSource

Out of scope here, but for the record: a Partner Center account with a verified publisher, the zip from step 5, and the privacy (`webUrl/privacy/`), terms (`webUrl/terms/`) and website (`webUrl/`) URLs, which the web app serves from the documents in this folder.

## Local development

You don't need Teams for most of it.

```sh
pnpm install
pnpm dev
```

That starts the API on <http://localhost:3978> in development mode and the web app on <http://localhost:5173>. Outside Teams, the web app plays the part of Teams and the bot itself, using development-only API routes:

- <http://localhost:5173/teams/start/> starts a vote as "Ada".
- Copy the vote URL without the `#token=…` part, add `?user=Bob`, and open it in another tab to join as someone else.
- Add `&theme=dark` or `&theme=contrast` to see the other Teams themes.

To try the real thing in Teams from your machine, you need a public HTTPS tunnel to port 3978 (for example Microsoft dev tunnels), a second bot whose messaging endpoint points at the tunnel, and a second Teams package built with that bot's id. A second Bicep deployment with another `prefix` gives you the bot; put its `CLIENT_ID`, `CLIENT_SECRET` and `TENANT_ID` in `src/api/.env.local`.
