import { route } from '@rooted/router/routes'

/** Teams opens this when someone adds TVote to a meeting, see `configurableTabs` in the Teams manifest. */
export const MeetingConfigureRoute = route`/teams/configure/`({
	async resolve({ create }) {
		const { MeetingConfigure } = await import('./meeting-configure.mts')
		return create(MeetingConfigure)
	},
	seo: {
		title: 'Add TVote to this meeting',
		noIndex: true,
		excludeFromSitemap: true,
	},
})

/** TVote's panel in a meeting, where the configuration page points the tab. */
export const MeetingPanelRoute = route`/teams/meeting/`({
	async resolve({ create }) {
		const { MeetingPanel } = await import('./meeting-panel.mts')
		return create(MeetingPanel)
	},
	seo: {
		title: 'TVote',
		noIndex: true,
		excludeFromSitemap: true,
	},
})
