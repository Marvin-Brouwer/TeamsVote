import { deckIds, decks, defaultDeckId, type DeckId } from '../../sessions/decks.mts'
import { maxTopicLength } from '../../sessions/topic.mts'

import type { IAdaptiveCard } from '@microsoft/teams.cards'

export const startFormAction = 'start'

/** What the form sends. `action` is how the Teams SDK routes it to `dialog.submit.start`; the inputs come along by id. */
export type StartFormData = {
	readonly action: typeof startFormAction
	readonly topic?: unknown
	readonly deck?: unknown
}

/** What to fill the form with when it comes back, with a problem to point out. */
export type StartFormRetry = {
	readonly problem: string
	readonly topic?: string
	readonly deck?: DeckId
}

/** The dialog behind "Start estimate": what's being estimated, and with which cards. */
export function startForm(retry?: StartFormRetry): IAdaptiveCard {
	const data: StartFormData = { action: startFormAction }

	return {
		type: 'AdaptiveCard',
		version: '1.5',
		body: [
			...(retry ? [{ type: 'TextBlock' as const, text: retry.problem, color: 'Attention' as const, wrap: true }] : []),
			{
				type: 'Input.Text',
				id: 'topic',
				label: 'What are you estimating?',
				placeholder: 'PROJ-123, or a link to the issue',
				maxLength: maxTopicLength,
				isRequired: true,
				errorMessage: 'Tell me what to estimate.',
				value: retry?.topic,
			},
			{
				type: 'Input.ChoiceSet',
				id: 'deck',
				label: 'Cards',
				style: 'compact',
				value: retry?.deck ?? defaultDeckId,
				choices: deckIds.map(deckId => ({ title: deckLabel(deckId), value: deckId })),
			},
		],
		actions: [
			{ type: 'Action.Submit', title: 'Start', style: 'positive', data },
		],
	}
}

function deckLabel(deckId: DeckId): string {
	const { label, cards } = decks[deckId]
	return `${label} (${cards.map(card => card.value).join(', ')})`
}
