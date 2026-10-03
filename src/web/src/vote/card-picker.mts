import { component } from '@rooted/components'
import { decks, unsureVote, type SessionView } from '@teams-vote/api/contracts'

import { ApiError, type SessionClient } from '../_shared/api/api-client.mts'
import styles from './card-picker.css'
import { cardsPerRow, cardsThatFit } from './card-picker.rows.mts'

import type { SessionStore } from './vote.store.mts'
import type { ToggleButton } from '@fluentui/web-components'

export type CardPickerOptions = {
	readonly session: SessionStore
	readonly client: SessionClient
}

/**
 * The cards of the deck, plus "?", as portrait playing cards. Your pick stays highlighted. Locked while the votes are revealed.
 * When they don't fit on one row they spread over as few rows as fit, evenly, centred: see `card-picker.rows.mts`.
 */
export const CardPicker = component<CardPickerOptions>({
	name: 'card-picker',
	styles,
	onMount({ append, element, options, signal }) {
		const initial = options.session.value
		if (!initial) return

		const values = [...decks[initial.deck].cards.map(card => card.value), unsureVote]
		const error = element('p', {
			classes: styles.error,
			role: 'alert',
		})

		const buttons = new Map<string, ToggleButton>(values.map(value => [
			value,
			element('fluent-toggle-button', {
				classes: styles.card,
				textContent: value,
				title: value === unsureVote ? 'I don\'t know' : `Vote ${value}`,
				on: {
					click() {
						void vote(value)
					},
				},
			}),
		]))

		async function vote(value: string) {
			error.textContent = ''
			// Show the pick straight away, the server confirms it a moment later.
			markPicked(value)
			try {
				await options.client.vote(value)
			} catch (failure) {
				error.textContent = failure instanceof ApiError ? failure.message : 'Your vote didn\'t go through. Please try again.'
				render(options.session.value)
			}
		}

		// Pressed for assistive tech, and in the brand colour so the pick stands out at a glance.
		function markPicked(picked: string | undefined) {
			for (const [value, button] of buttons) {
				button.pressed = value === picked
				button.appearance = value === picked ? 'primary' : undefined
			}
		}

		function render(view: SessionView | undefined) {
			if (!view) return
			markPicked(view.you.vote)
			for (const button of buttons.values()) button.disabled = view.revealed || view.ended
		}

		const cards = element('div', {
			classes: styles.cards,
			role: 'group',
			aria: {
				label: 'Your estimate',
			},
			children: [...buttons.values()],
		})
		const area = element('div', {
			classes: styles.area,
			children: cards,
		})
		append(area, error)

		// Capping the width of the centred, wrapping row is what makes the browser break it where we want.
		function balanceRows() {
			const firstCard = buttons.values().next().value
			if (!firstCard) return
			const gap = Number.parseFloat(getComputedStyle(cards).columnGap) || 0
			const cardWidth = firstCard.getBoundingClientRect().width
			const perRow = cardsPerRow(buttons.size, cardsThatFit(area.clientWidth, cardWidth, gap))
			cards.style.maxWidth = `${Math.ceil(perRow * cardWidth + (perRow - 1) * gap)}px`
		}
		const resizeObserver = new ResizeObserver(balanceRows)
		resizeObserver.observe(area)
		signal.addEventListener('abort', () => {
			resizeObserver.disconnect()
		})

		render(initial)
		options.session.on('change', signal, ({ detail }) => {
			render(detail.state)
		})
	},
})
