import { component } from '@rooted/components'
import { skipVote, unsureVote, type ParticipantView, type SessionView } from '@t-vote/api/contracts'

import styles from './participant-list.css'

import type { SessionStore } from './vote.store.mts'
import type { BadgeAppearance, BadgeColor } from '@fluentui/web-components'

export type ParticipantListOptions = {
	readonly session: SessionStore
}

type BadgeLook = {
	readonly text: string
	readonly appearance: BadgeAppearance
	readonly color: BadgeColor
}

/** Everyone who opened the vote, and where they are. Votes only show once the admin reveals them. */
export const ParticipantList = component<ParticipantListOptions>({
	name: 'participant-list',
	styles,
	onMount({ append, element, options, signal }) {
		const list = element('ul', {
			classes: styles.list,
			aria: {
				label: 'Participants',
			},
		})
		const average = element('p', {
			classes: styles.average,
			aria: {
				live: 'polite',
			},
		})
		append(list, average)

		function badge(look: BadgeLook) {
			return element('fluent-badge', {
				appearance: look.appearance,
				color: look.color,
				textContent: look.text,
			})
		}

		function render(view: SessionView | undefined) {
			if (!view) return

			list.replaceChildren(
				...view.participants.map(participant => element('li', {
					classes: styles.participant,
					children: [
						element('span', {
							classes: styles.name,
							textContent: participant.id === view.you.id ? `${participant.name} (you)` : participant.name,
						}),
						participant.admin
							? element('span', {
								classes: styles.role,
								textContent: 'host',
							})
							: undefined,
						badge(participantBadge(participant, view.revealed)),
					],
				})),
			)

			average.replaceChildren(
				...(view.revealed
					? [
						element('span', {
							textContent: 'Average',
						}),
						element('strong', {
							classes: styles.averageValue,
							textContent: view.average ?? '—',
						}),
					]
					: []),
			)
		}

		render(options.session.value)
		options.session.on('change', signal, ({ detail }) => {
			render(detail.state)
		})
	},
})

function participantBadge(participant: ParticipantView, revealed: boolean): BadgeLook {
	if (!revealed) {
		return participant.status === 'voted'
			? { text: 'Voted', appearance: 'filled', color: 'success' }
			: { text: 'Waiting', appearance: 'ghost', color: 'subtle' }
	}
	if (participant.vote === undefined) return { text: 'No vote', appearance: 'ghost', color: 'subtle' }
	if (participant.vote === skipVote) return { text: 'Skipped', appearance: 'ghost', color: 'subtle' }
	if (participant.vote === unsureVote) return { text: '?', appearance: 'tint', color: 'warning' }
	return { text: participant.vote, appearance: 'filled', color: 'brand' }
}
