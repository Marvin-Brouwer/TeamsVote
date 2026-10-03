import { component } from '@rooted/components'

import { Notice } from '../feedback/notice.mts'

/** What a Teams-only page shows when someone opens it in a plain browser. */
export const OpenInTeams = component({
	name: 'open-in-teams',
	onMount({ append, create }) {
		append(create(Notice, {
			intent: 'info',
			message: 'This page only works inside Microsoft Teams. Start or join an estimate from TVote in a chat.',
		}))
	},
})
