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

export type VoteBoardOptions = {
	readonly session: SessionStore
	readonly connection: Store<ConnectionState>
	readonly client: SessionClient
	readonly host: TeamsHost
}

/** The vote dialog: what's being estimated, who voted, the cards, and for the admin the controls. */
export const VoteBoard = component<VoteBoardOptions>({
	name: 'vote-board',
	styles,
	onMount({ append, element, create, options, signal }) {
		const { session, connection, client, host } = options
		const initial = session.value
		if (!initial) return

		const status = element('div', {
			classes: styles.status,
			aria: {
				live: 'polite',
			},
		})

		append(
			element('div', {
				classes: styles.root,
				children: [
					create(TopicHeading, {
						topic: initial.topic,
						deck: initial.deck,
					}),
					status,
					create(ParticipantList, {
						session,
					}),
					element('div', {
						classes: styles.controls,
						children: [
							create(CardPicker, {
								session,
								client,
							}),
							initial.you.admin
								? create(AdminPanel, {
									session,
									client,
									host,
								})
								: undefined,
						],
					}),
				],
			}),
		)

		function showStatus() {
			status.replaceChildren(
				...(connection.value === 'reconnecting'
					? [
						create(Notice, {
							intent: 'warning',
							message: 'Lost the connection, reconnecting…',
						}),
					]
					: []),
			)
		}

		connection.on('change', signal, showStatus)
		// By the time the vote ends, the bot has already put the result on the card in the chat.
		session.on('change', signal, ({ detail }) => {
			if (detail.state?.ended) host.submit({ action: 'close' })
		})
		showStatus()
	},
})
