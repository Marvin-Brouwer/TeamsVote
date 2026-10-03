import { route } from '@rooted/router/routes'

/** The message extension opens this directly, see `taskInfo` in the Teams manifest. */
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
