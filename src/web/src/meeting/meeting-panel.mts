import { component } from '@rooted/components'

import { trace } from '../_shared/diagnostics/trace.mts'
import { connectTeams } from '../_shared/teams/teams-host.mts'
import { HowTo } from './how-to.mts'
import styles from './meeting.css'

/**
 * TVote's tab in a meeting: the side panel, or a tab in the meeting chat. It's there so TVote can be added to a meeting,
 * which also puts the bot in the meeting chat. The estimates themselves happen in the chat.
 */
export const MeetingPanel = component({
	name: 'meeting-panel',
	styles,
	onMount({ append, element, create }) {
		trace('Meeting panel')
		append(
			element('div', {
				classes: styles.root,
				children: [
					element('h1', {
						textContent: 'Estimate together',
					}),
					create(HowTo),
				],
			}),
		)

		// Only for the theme, and to tell Teams the panel is ready. The text above doesn't need it.
		void connectTeams()
	},
})
