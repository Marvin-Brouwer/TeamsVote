import { component } from '@rooted/components'

import { Notice } from '../_shared/feedback/notice.mts'
import { AdminPanel } from './admin-panel.mts'
import { CardPicker } from './card-picker.mts'
import { ParticipantList } from './participant-list.mts'
import { TopicHeading } from './topic-heading.mts'
import styles from './vote-board.css'

import type { SessionClient } from '../_shared/api/api-client.mts'
import type { TeamsHost } from '../_shared/teams/teams-host.mts'
import type { ConnectionState, SessionStore } from './vote.store.mts'
import type { Store } from '@rooted/store'
import type { SessionView } from '@teams-vote/api/contracts'

export type VoteBoardOptions = {
	readonly session: SessionStore
	readonly connection: Store<ConnectionState>
	readonly client: SessionClient
	readonly host: TeamsHost
}

// Long enough to read the result, short enough not to feel stuck.
const closeAfterEndMs = 4000

/** The vote dialog: what's being estimated, who voted, the cards, and for the admin the controls. */
export const VoteBoard = component<VoteBoardOptions>({
	name: 'vote-board',
	styles,
	onMount({ append, element, create, options, signal }) {
		const { session, connection, client, host } = options
		const initial = session.value
		if (!initial) return

		const status = element('div', { classes: styles.status, aria: { live: 'polite' } })

		append(element('div', {
			classes: styles.root,
			children: [
				create(TopicHeading, { topic: initial.topic, deck: initial.deck }),
				status,
				create(ParticipantList, { session }),
				element('div', {
					classes: styles.controls,
					children: [
						create(CardPicker, { session, client }),
						initial.you.admin ? create(AdminPanel, { session, client, host }) : undefined,
					],
				}),
			],
		}))

		function showStatus() {
			const view = session.value
			if (view?.ended) {
				status.replaceChildren(create(Notice, { intent: 'success', message: endedMessage(view) }))
				return
			}
			status.replaceChildren(...(connection.value === 'reconnecting'
				? [create(Notice, { intent: 'warning', message: 'Lost the connection, reconnecting…' })]
				: []))
		}

		connection.on('change', signal, showStatus)
		session.on('change', signal, ({ detail }) => {
			showStatus()
			// The admin's dialog closes itself by accepting. Everyone else's closes after a moment to read the result.
			if (detail.state?.ended && !detail.state.you.admin) {
				setTimeout(() => {
					host.submit({ action: 'close' })
				}, closeAfterEndMs)
			}
		})
		showStatus()
	},
})

function endedMessage(view: SessionView): string {
	return view.average === undefined
		? 'This vote has ended.'
		: `The estimate is ${view.average}.`
}
