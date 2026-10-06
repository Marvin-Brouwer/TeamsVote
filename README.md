# TVote

Teams scrum voting, but simple.

Every planning poker tool does too much. TVote asks the meeting for an estimate, everyone votes right on the card in the chat, and the card turns into the result. Votes live in memory for as long as the vote runs, nothing is stored.

## How it works

1. Add TVote to a meeting, through **Apps**. It posts a card in the meeting chat.
2. **Start estimate** on that card, and fill in what you're estimating: a Jira key, a link, or just a few words.
3. Everyone clicks their value on the vote card. Everyone sees who voted, not what.
4. Whoever started it shows the votes, re-votes if needed, and accepts. The card turns into the estimate: the average, rounded to the nearest card.

Decks: modified Fibonacci (default), Fibonacci, and t-shirt sizes. `?` counts as having voted but not towards the average.

## Repository layout

| Folder | What | Hosted on |
|---|---|---|
| [`src/api`](./src/api) | The Teams bot, on the [Teams SDK](https://www.npmjs.com/package/@microsoft/teams.apps): the start card, the start form and the vote card, and every click on them. Keeps votes in memory only. | Azure App Service, West Europe |
| [`src/web`](./src/web) | The home, privacy and terms pages, and the meeting tab. Built with [rooted](https://github.com/Marvin-Brouwer/rooted) and Fluent 2 web components, themed with the Teams tokens. | Azure Static Web Apps |
| [`teams`](./teams) | The Teams app manifest and the script that packages it. | Uploaded to Teams |
| [`infra`](./infra) | Bicep for the Azure and Entra ID side: the bot's managed identity, the App Service, the Azure Bot, the Static Web App and the deploy identity. | Deployed by hand |
| [`doc`](./doc) | [Setup](./doc/setup.md), privacy policy, terms, and the GDPR and AppSource paperwork. | |

## Development

```sh
pnpm install
pnpm test         # the session rules, the cards and every click
pnpm lint
pnpm typecheck
pnpm dev          # the web pages on :5173, the API on :3978
```

The voting itself only happens in Teams. [doc/setup.md](./doc/setup.md) covers local development, everything that has to be set up in Azure, GitHub and Teams, and the move from the earlier Render setup.
