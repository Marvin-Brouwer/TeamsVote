# TVote

Teams scrum voting, but simple.

Every planning poker tool does too much. TVote asks the chat for an estimate, everyone votes in a dialog, and the card in the chat is replaced with the result. Votes live in memory for as long as the vote runs, nothing is stored.

## How it works

1. Someone starts a vote: `@TVote PROJ-123`, or **…** below the message box → TVote → Start estimate.
2. The bot posts a card. Everyone clicks **Vote** and picks a card in the dialog.
3. Whoever started it shows the votes, re-votes if needed, and accepts.
4. The card is replaced with the estimate: the average, rounded to the nearest card.

Decks: modified Fibonacci (default), Fibonacci, and t-shirt sizes. `?` counts as having voted but not towards the average.

## Repository layout

| Folder | What | Hosted on |
|---|---|---|
| [`src/api`](./src/api) | The session API and the Teams bot, on the [Teams SDK](https://www.npmjs.com/package/@microsoft/teams.apps). Keeps sessions in memory only. Also exports the contracts the web app uses (`@teams-vote/api/contracts`). | Render, Frankfurt |
| [`src/web`](./src/web) | The start and vote dialogs, plus the home and legal pages. Built with [rooted](https://github.com/Marvin-Brouwer/rooted) and Fluent 2 web components, themed with the Teams tokens. | Azure Static Web Apps |
| [`teams`](./teams) | The Teams app manifest and the script that packages it. | Uploaded to Teams |
| [`infra`](./infra) | Bicep for the Azure and Entra ID side: app registrations, Azure Bot, Static Web App. | Deployed by hand |
| [`doc`](./doc) | [Setup](./doc/setup.md), privacy policy, terms, and the GDPR and AppSource paperwork. | |

## Development

```sh
pnpm install
pnpm dev          # API on :3978 and web app on :5173, Teams faked in the browser
pnpm lint
pnpm typecheck
pnpm test
```

[doc/setup.md](./doc/setup.md) covers local development in more detail, and everything that has to be set up by hand in Azure, Render, GitHub and Teams.
