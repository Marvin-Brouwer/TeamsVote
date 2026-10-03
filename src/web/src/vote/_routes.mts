import { route, token } from '@rooted/router/routes'

/** The bot opens this as a dialog, with the session token in the URL fragment. */
export const VoteRoute = route`/teams/vote/${token('session', String)}/`({
	async resolve({ create, tokens }) {
		const { VotePage } = await import('./vote.mts')
		return create(VotePage, {
			sessionId: tokens.session,
		})
	},
	seo: {
		title: 'Vote',
		noIndex: true,
		excludeFromSitemap: true,
	},
})
