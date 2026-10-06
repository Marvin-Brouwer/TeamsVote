import { createMiddleware } from '@rooted-adapters/express/middleware'
import { mountTVote } from '@t-vote/api'

// The bot and /health, ahead of the pages. Runs in the built server and in `vite dev` alike.
export default createMiddleware(async app => {
	await mountTVote(app)
})
