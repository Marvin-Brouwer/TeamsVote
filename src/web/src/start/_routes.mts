import { route } from '@rooted/router/routes'

/** The bot opens this for "Start estimate" under the message box, once TVote is in the chat. See `start-dialog.mts` in the API. */
export const StartRoute = route`/teams/start/`({
	async resolve({ create }) {
		const { StartPage } = await import('./start.mts')
		return create(StartPage)
	},
	seo: {
		title: 'Start an estimate',
		noIndex: true,
		excludeFromSitemap: true,
	},
})
