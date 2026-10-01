import { deckIds, decks } from '../../contracts/decks.mts'

import type { IAdaptiveCard } from '@microsoft/teams.cards'

export function helpCard(problem?: string): IAdaptiveCard {
	return {
		type: 'AdaptiveCard',
		version: '1.5',
		body: [
			...(problem ? [{ type: 'TextBlock' as const, text: problem, color: 'Attention' as const, wrap: true }] : []),
			{ type: 'TextBlock', text: 'Start an estimate', weight: 'Bolder', size: 'Medium' },
			{ type: 'TextBlock', text: 'Mention me with what you want to estimate, a Jira link works too:', wrap: true },
			{ type: 'TextBlock', text: '`@TVote PROJ-123`  \n`@TVote https://example.atlassian.net/browse/PROJ-123 --t-shirt`', wrap: true, fontType: 'Monospace' },
			{ type: 'TextBlock', text: 'Or use **…** below the message box and pick **TVote**.', wrap: true },
			{ type: 'TextBlock', text: 'Decks', weight: 'Bolder', spacing: 'Medium' },
			{
				type: 'FactSet',
				facts: deckIds.map(deckId => ({
					title: `--${deckId}`,
					value: decks[deckId].cards.map(card => card.value).join(', '),
				})),
			},
		],
	}
}
