import { component } from '@rooted/components'

import { trace } from '../_shared/diagnostics/trace.mts'
import { connectTeams } from '../_shared/teams/teams-host.mts'
import { HowTo } from './how-to.mts'
import styles from './meeting.css'

/**
 * What Teams shows when someone adds TVote to a meeting. There's nothing to choose, so it's valid straight away;
 * saving points the tab at the meeting panel.
 */
export const MeetingConfigure = component({
	name: 'meeting-configure',
	styles,
	async onMount({ append, element, create }) {
		trace('Meeting tab configuration')
		append(
			element('div', {
				classes: styles.root,
				children: [
					element('h1', {
						textContent: 'Add TVote to this meeting',
					}),
					element('p', {
						classes: styles.note,
						textContent: 'TVote joins the meeting chat, so it can post vote cards there.',
					}),
					create(HowTo),
				],
			}),
		)

		const host = await connectTeams()
		if (host.kind !== 'teams') return

		const { pages } = await import('@microsoft/teams-js')
		pages.config.registerOnSaveHandler(saveEvent => {
			pages.config.setConfig({
				entityId: 'tvote-meeting',
				contentUrl: new URL('/teams/meeting/', window.location.origin).href,
				suggestedDisplayName: 'TVote',
			}).then(() => {
				trace('Saved the meeting tab')
				saveEvent.notifySuccess()
			}, (error: unknown) => {
				trace('Could not save the meeting tab', error)
				saveEvent.notifyFailure(error instanceof Error ? error.message : String(error))
			})
		})
		pages.config.setValidityState(true)
		trace('The meeting tab can be saved')
	},
})
