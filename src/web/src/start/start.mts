import { component } from '@rooted/components'

import { waitForApi } from '../_shared/api/api-health.mts'
import { connectTeams } from '../_shared/teams/teams-host.mts'
import { OpenInTeams } from '../_shared/teams/open-in-teams.mts'
import { WakingUp } from '../_shared/waking-up/waking-up.mts'
import { StartForm } from './start-form.mts'

/**
 * The "Start estimate" dialog. Waits for the API before showing the form:
 * submitting goes to the bot, and the bot has to be awake to answer in time.
 */
export const StartPage = component({
	name: 'start-page',
	async onMount({ replace, create, signal }) {
		replace(create(WakingUp))

		const host = await connectTeams()
		if (host.kind === 'browser') {
			replace(create(OpenInTeams))
			return
		}

		try {
			await waitForApi(signal)
		} catch {
			return
		}

		replace(create(StartForm, { host }))
	},
})
