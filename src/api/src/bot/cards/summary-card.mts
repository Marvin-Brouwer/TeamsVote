import { decks, skipVote, unsureVote } from '../../sessions/decks.mts'
import { topicMarkdown } from './topic-markdown.mts'

import type { Session } from '../../sessions/session.mts'
import type { IAdaptiveCard } from '@microsoft/teams.cards'

/** Replaces the vote card once the admin accepts. The average is plain text, so it can be selected and copied. */
export function summaryCard(session: Session, average: string | undefined): IAdaptiveCard {
	const counted = [...session.votes.values()].filter(vote => vote !== unsureVote && vote !== skipVote).length

	return {
		type: 'AdaptiveCard',
		version: '1.5',
		body: [
			{ type: 'TextBlock', text: 'Estimate', size: 'Small', isSubtle: true, spacing: 'None' },
			{ type: 'TextBlock', text: topicMarkdown(session.topic), size: 'Large', weight: 'Bolder', wrap: true, spacing: 'None' },
			average === undefined
				? { type: 'TextBlock', text: 'Nobody voted a card, so there is no estimate.', wrap: true }
				: { type: 'TextBlock', text: average, size: 'ExtraLarge', weight: 'Bolder', color: 'Accent' },
			{
				type: 'TextBlock',
				text: `${decks[session.deck].label} · average of ${counted} ${counted === 1 ? 'vote' : 'votes'}, rounded to the nearest card`,
				isSubtle: true,
				wrap: true,
				spacing: 'None',
			},
		],
	}
}
