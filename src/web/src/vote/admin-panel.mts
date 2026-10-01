import { component } from '@rooted/components'
import { skipVote, type SessionView } from '@teams-vote/api/contracts'

import { ApiError, type SessionClient } from '../_shared/api/api-client.mts'
import styles from './admin-panel.css'

import type { TeamsHost } from '../_shared/teams/teams-host.mts'
import type { SessionStore } from './vote.store.mts'

export type AdminPanelOptions = {
	readonly session: SessionStore
	readonly client: SessionClient
	readonly host: TeamsHost
}

/**
 * Only for the person who started the vote. Show the votes, re-vote, or accept.
 * Accepting goes through Teams to the bot, which replaces the vote card with the result and closes this dialog.
 */
export const AdminPanel = component<AdminPanelOptions>({
	name: 'admin-panel',
	styles,
	onMount({ append, element, options, signal }) {
		const { session, client, host } = options
		const error = element('p', { classes: styles.error, role: 'alert' })

		async function run(action: () => Promise<void>) {
			error.textContent = ''
			try {
				await action()
			} catch (failure) {
				error.textContent = failure instanceof ApiError ? failure.message : 'That didn\'t work. Please try again.'
			}
		}

		const skipButton = element('fluent-button', {
			appearance: 'subtle',
			textContent: 'Skip my vote',
			on: { click: () => void run(() => client.vote(skipVote)) },
		})
		const revealButton = element('fluent-button', {
			appearance: 'primary',
			textContent: 'Show votes',
			on: { click: () => void run(() => client.reveal()) },
		})
		const revoteButton = element('fluent-button', {
			textContent: 'Re-vote',
			on: { click: () => void run(() => client.reset()) },
		})
		const acceptButton = element('fluent-button', {
			appearance: 'primary',
			on: {
				click() {
					acceptButton.disabled = true
					host.submit({ action: 'accept', sessionId: client.sessionId })
				},
			},
		})

		function render(view: SessionView | undefined) {
			if (!view) return
			skipButton.hidden = view.revealed
			revealButton.hidden = view.revealed
			revoteButton.hidden = !view.revealed
			acceptButton.hidden = !view.revealed
			acceptButton.textContent = view.average === undefined ? 'Close vote' : `Accept ${view.average}`

			for (const button of [skipButton, revealButton, revoteButton, acceptButton]) button.disabled = view.ended
		}

		append(
			element('div', {
				classes: styles.actions,
				children: [skipButton, revealButton, revoteButton, acceptButton],
			}),
			error,
		)

		render(session.value)
		session.on('change', signal, ({ detail }) => {
			render(detail.state)
		})
	},
})
