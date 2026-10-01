import { component } from '@rooted/components'
import { localStorage } from '@rooted/storage/web'
import { deckIds, decks, isDeckId, maxTopicLength, type DeckId, defaultDeckId } from '@teams-vote/api/contracts'

import styles from './start-form.css'

import type { TeamsHost } from '../_shared/teams/teams-host.mts'

export type StartFormOptions = {
	readonly host: TeamsHost
}

const deckStorageKey = 'teams-vote:deck'

/** Topic, deck, go. The deck is remembered on this device, the topic never is. */
export const StartForm = component<StartFormOptions>({
	name: 'start-form',
	styles,
	onMount({ append, element, options }) {
		const rememberedDeck = localStorage.get<string>(deckStorageKey)
		const initialDeck: DeckId = isDeckId(rememberedDeck) ? rememberedDeck : defaultDeckId

		const topicInput = element('fluent-text-input', {
			id: 'topic',
			slot: 'input',
			placeholder: 'PROJ-123, or a link to the issue',
			maxlength: maxTopicLength,
			autocomplete: 'off',
			on: {
				input() {
					startButton.disabled = topicInput.value.trim() === ''
				},
				keydown(event) {
					if (event.key === 'Enter' && !startButton.disabled) start()
				},
			},
		})

		const deckDropdown = element('fluent-dropdown', {
			id: 'deck',
			slot: 'input',
			children: element('fluent-listbox', {
				children: deckIds.map(deckId => element('fluent-option', {
					value: deckId,
					selected: deckId === initialDeck,
					textContent: deckLabel(deckId),
				})),
			}),
		})

		const startButton = element('fluent-button', {
			appearance: 'primary',
			disabled: true,
			textContent: 'Start',
			on: {
				click: start,
			},
		})

		function start() {
			const deck = isDeckId(deckDropdown.value) ? deckDropdown.value : initialDeck
			localStorage.set(deckStorageKey, deck)
			startButton.disabled = true
			options.host.submit({ action: 'start', topic: topicInput.value.trim(), deck })
		}

		append(element('div', {
			classes: styles.root,
			children: element('form', {
				classes: styles.form,
				on: {
					submit(event) {
						event.preventDefault()
					},
				},
				children: [
					element('h1', { textContent: 'Start an estimate' }),
					element('fluent-field', {
						children: [
							element('label', { slot: 'label', htmlFor: 'topic', textContent: 'What are you estimating?' }),
							topicInput,
						],
					}),
					element('fluent-field', {
						children: [
							element('label', { slot: 'label', htmlFor: 'deck', textContent: 'Cards' }),
							deckDropdown,
						],
					}),
					element('div', {
						classes: styles.actions,
						children: startButton,
					}),
				],
			}),
		}))

		requestAnimationFrame(() => {
			topicInput.focus()
		})
	},
})

function deckLabel(deckId: DeckId): string {
	const { label, cards } = decks[deckId]
	return `${label} (${cards.map(card => card.value).join(', ')})`
}
