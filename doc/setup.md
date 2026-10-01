# TeamsVote setup

Everything you have to click yourself to get TeamsVote running. Do it in this order, later steps need values from earlier ones. Keep a scratch note: every value marked **→ note** is used again further down.

How the pieces fit:

```
Teams client ──(Bot Framework, authenticated by Microsoft)──▶ Render: src/api (Express + Teams SDK)
     │                                                         ├─ /api/messages   the bot
     │ dialogs                                                 ├─ /api/sessions/* votes, live state
     ▼                                                         └─ /health
Azure Static Web App: src/web (rooted, static files) ──fetch──▶ Render
```

## 0. Before you start

- An Azure subscription. Everything below is on a free tier. Budget alerts don't cap spending, so only create what's listed here.
- A Microsoft 365 tenant where you can upload custom Teams apps (see step 6). Use a tenant you'll keep, not a developer sandbox that can expire: the bot's identity lives in it, for every organisation that installs the app.
- The Render account and web service you already have, in region Frankfurt.
- Recommended before AppSource: a domain of your own for the web app. The domain is in the Teams manifest, so changing it later means a new app version and a resubmission.

## 1. Bot app registration (Entra ID)

1. Azure portal → Microsoft Entra ID → App registrations → New registration.
2. Name `TeamsVote Bot`. Supported account types: **Accounts in this organizational directory only (single tenant)**. No redirect URI. Register.
3. **→ note** the Application (client) ID as `CLIENT_ID`, and the Directory (tenant) ID as `TENANT_ID`.
4. Certificates & secrets → Client secrets → New client secret, 24 months. **→ note** the *Value* (not the ID) as `CLIENT_SECRET`. Put the expiry date in your calendar: when the secret lapses, the bot can no longer post or update cards.
5. Leave API permissions as they are. The bot needs none.

Single tenant is deliberate. Microsoft no longer lets you create multi-tenant bots, and it doesn't need to be one: other organisations can still install the app from the store. The bot only ever signs in to *your* tenant to talk to Teams.

## 2. Azure Bot resource

1. Create a resource → **Azure Bot**.
2. Bot handle `teamsvote-bot`, a resource group like `rg-teamsvote`, pricing tier **Free (F0)**.
3. Type of App: **Single Tenant**. Creation type: **Use existing app registration**. App ID: `CLIENT_ID`, App tenant ID: `TENANT_ID`.
4. Once created: Settings → Configuration → Messaging endpoint `https://<your-render-host>/api/messages` → Apply.
5. Settings → Channels → **Microsoft Teams** → accept the terms → Apply.

## 3. Azure Static Web App

1. Create a resource → **Static Web App**. Resource group `rg-teamsvote`, name `teamsvote-web`, plan **Free**, region **West Europe**, deployment source **Other**. The GitHub workflow deploys it, not Azure.
2. **→ note** the resource name, and the URL on the overview page (`https://<something>.azurestaticapps.net`).
3. Custom domain (recommended): Static Web App → Custom domains → Add → Custom domain on other DNS. Add the CNAME it shows at your DNS provider, then validate. The certificate is free and renews itself.
4. **→ note** the final origin, like `https://teamsvote.example.com`, as `WEB_URL`. No trailing slash.

## 4. GitHub → Azure deploys (OIDC, the same setup rooted uses)

No long-lived deployment secret: GitHub proves who it is, and the workflow fetches the deployment token when it needs it.

1. Entra ID → App registrations → New registration `teamsvote-github-deploy`, single tenant.
2. In it: Certificates & secrets → Federated credentials → Add credential → *GitHub Actions deploying Azure resources*. Organisation `Marvin-Brouwer`, repository `TeamsVote`, entity type **Environment**, environment name `production`.
3. The Static Web App → Access control (IAM) → Add role assignment → **Contributor** → members: `teamsvote-github-deploy`. Scope it to this one resource.
4. GitHub repository → Settings → Environments → New environment `production`. Also create `render-api`, the API workflow deploys into that one.
5. Repository secrets (Settings → Secrets and variables → Actions → Secrets):
   - `AZURE_CLIENT_ID`: the client ID of `teamsvote-github-deploy`, not the bot's
   - `AZURE_TENANT_ID`
   - `AZURE_SUBSCRIPTION_ID`
   - `RENDER_API_KEY` (you probably have this one already)
6. Repository variables (same page, Variables tab):
   - `AZURE_STATIC_WEBAPP_NAME`: `teamsvote-web`
   - `AZURE_RESOURCE_GROUP`: `rg-teamsvote`
   - `WEB_URL`: from step 3
   - `API_URL`: the Render URL, like `https://teamsvote.onrender.com`
   - `RENDER_SERVICE_ID` (you probably have this one already)
   - `BOT_CLIENT_ID`: the bot's `CLIENT_ID` from step 1. It's not a secret, it ends up in the Teams manifest.
   - `TEAMS_APP_ID`: see step 7.

## 5. Render

1. Service settings:
   - Region: Frankfurt
   - Build command: `pnpm install --frozen-lockfile && pnpm deploy:build`
   - Start command: `pnpm deploy:start`
   - Health check path: `/health`
   - Auto-deploy: off. The *Publish API* workflow deploys after lint, typecheck and tests pass.
2. Environment variables:
   - `CLIENT_ID`, `CLIENT_SECRET`, `TENANT_ID`: from step 1. The Teams SDK reads these itself.
   - `WEB_URL`: from step 3. Used for CORS and for the dialog URLs the bot hands out.
   - `SESSION_TOKEN_SECRET`: a long random string, for example from `openssl rand -base64 48`. It signs the per-vote keys. Changing it signs everyone out of running votes, nothing worse.
   - Optional `LOG_LEVEL`: `warn` by default. `info` also logs each request (method, path, status, time; never names or ids).
   - Don't set `NODE_ENV=production`: pnpm would skip the dev dependencies the build needs.
3. Remove the old variables: `TEAMS_CHATBOT_CLIENT_ID`, `TEAMS_CHATBOT_CLIENT_SECRET`, `TEAMS_PLUGIN_TENANT_ID`, `VITE_UI_APP_URL`.

The free tier sleeps after about 15 minutes without traffic, and waking takes up to a minute. The start dialog shows a "waking things up" note while that happens. A click on a card's Vote button right after a quiet spell can still time out in Teams; clicking again works.

## 6. Teams tenant settings

Once per tenant you test in, in the Teams admin center:

1. Teams apps → Setup policies → Global (Org-wide default) → **Upload custom apps: On**.
2. Teams apps → Manage apps → Actions → Org-wide app settings → **Let users interact with custom apps: On**.

These can take a few hours to apply.

## 7. Teams app package

1. Generate a GUID once (`uuidgen`, or `[guid]::NewGuid()` in PowerShell) and store it as the `TEAMS_APP_ID` repository variable. It's the identity of the Teams app itself, separate from the bot's, and must never change: a new id is a different app to Teams and to AppSource.
2. Build the package:
   - In GitHub: Actions → *Teams app package* → Run workflow, then download the zip from the run's artifacts.
   - Or locally: put `TEAMS_APP_ID`, `BOT_CLIENT_ID` and `WEB_URL` in `teams/.env`, then run `pnpm build:teams-package`. The zip lands in `teams/dist/`.
3. Teams → Apps → Manage your apps → Upload an app → **Upload a custom app**, pick the zip. The Teams Developer Portal (Apps → Import app) works too, and validates the package.
4. Add TVote to a group chat, and to a meeting's chat. That installs the bot there, and the bot can only post cards where it's installed.

## 8. Smoke test

- In the chat, send `@TVote help`, then `@TVote PROJ-1`. A vote card appears.
- Below the message box: **…** → TVote → **Start estimate**. The dialog opens, fill in a topic, Start. A card appears and your vote dialog opens.
- Do the same in a meeting chat.
- Vote from two accounts, **Show votes**, **Re-vote**, vote again, **Accept**. The vote card turns into the result, and the other person's dialog closes after showing it.
- Switch Teams to dark, and to high contrast, with a dialog open. It should follow along.

## 9. Clean up the old setup

- Teams Developer Portal → Tools → Bot management: delete the old bot.
- Entra ID → App registrations: delete the old SSO registration (the old `TEAMS_APP_CLIENT_ID`) and the old bot registration.
- GitHub → Settings → Pages: unpublish the old site.
- Repository secrets you can delete: `TEAMS_PLUGIN_TENANT_ID`, `TEAMS_PLUGIN_AZURE_CLIENT_ID`, `TEAMS_PLUGIN_AZURE_CLIENT_SECRET`, `TEAMS_PLUGIN_AZURE_CLIENT_URL`, `TEAMS_APP_ID` (now a variable), `TEAMS_CHATBOT_CLIENT_ID`, `TEAMS_CHATBOT_CLIENT_SECRET`. And the variable `TEAMS_UI_URL`.
- The old app in Teams: upload the new package with a new `TEAMS_APP_ID`, or reuse the old id if you want existing installs to update in place.

## 10. Later: AppSource

Out of scope here, but for the record: you'll need a Partner Center account with a verified publisher, the zip from step 7, and the privacy (`WEB_URL/privacy/`), terms (`WEB_URL/terms/`) and website (`WEB_URL/`) URLs, which the web app serves from the documents in this folder.

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

To try the real thing in Teams from your machine, you need a public HTTPS tunnel to port 3978 (for example Microsoft dev tunnels), a second bot registration whose messaging endpoint points at the tunnel, and a second Teams package built with that bot's id. Put its `CLIENT_ID`, `CLIENT_SECRET` and `TENANT_ID` in `src/api/.env.local`.
