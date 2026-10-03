import { decks } from '../../contracts/decks.mts'
import { topicMarkdown } from './topic-markdown.mts'

import type { Session, SessionUser } from '../../sessions/session.mts'
import type { IAdaptiveCard } from '@microsoft/teams.cards'

export const voteDialogId = 'vote'

/** The data the "Vote" button sends. `dialog_id` is how the Teams SDK routes it to `dialog.open.vote`. */
export type VoteButtonData = {
	readonly dialog_id: typeof voteDialogId
	readonly sessionId: string
}

/** Posted when a vote starts. The summary card replaces it once the admin accepts. */
export function voteCard(session: Session, admin: SessionUser): IAdaptiveCard {
	const data: VoteButtonData & { msteams: { type: 'task/fetch' } } = {
		msteams: { type: 'task/fetch' },
		dialog_id: voteDialogId,
		sessionId: session.id,
	}

	return {
		type: 'AdaptiveCard',
		version: '1.5',
		body: [
			{ type: 'TextBlock', text: 'Estimate', size: 'Small', isSubtle: true, spacing: 'None' },
			{ type: 'TextBlock', text: topicMarkdown(session.topic), size: 'Large', weight: 'Bolder', wrap: true, spacing: 'None' },
			{ type: 'TextBlock', text: `${decks[session.deck].label} · started by ${admin.name}`, isSubtle: true, wrap: true },
		],
		actions: [
			{ type: 'Action.Submit', title: 'Vote', style: 'positive', data },
		],
	}
}
