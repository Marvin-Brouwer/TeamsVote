import { averageVote } from '../../sessions/average.mts'
import { decks, unsureVote } from '../../sessions/decks.mts'
import { isAdmin, type Session, type SessionUser } from '../../sessions/session.mts'
import { inRows } from './button-rows.mts'
import { topicMarkdown } from './topic-markdown.mts'

import type { CardElement, IAdaptiveCard, IExecuteAction } from '@microsoft/teams.cards'

// Teams shows about this many buttons on a row before it tucks the rest away behind "…".
const maxButtonsPerRow = 5
// Teams only refreshes a card by itself for the listed users once a chat has more than 60 people.
const maxRefreshUsers = 60

/**
 * What the vote card's buttons send, as `Action.Execute`. `action` is how the Teams SDK routes it,
 * to `card.action.vote` and so on. `refresh` is Teams asking for someone's own view of the card.
 */
export type VoteCardAction =
	| { readonly action: 'vote', readonly sessionId: string, readonly vote: string }
	| { readonly action: 'refresh' | 'reveal' | 'reset' | 'accept', readonly sessionId: string }

/**
 * The vote card. Without `viewer` it's the card everyone sees: who voted, never what.
 * With `viewer` it's that person's own view: their vote highlighted, and for whoever started it, the buttons to
 * show the votes, re-vote and accept. Teams asks for the own views by itself, through `refresh`.
 */
export function voteCard(session: Session, viewer?: SessionUser): IAdaptiveCard {
	const admin = session.participants.get(session.adminId)
	const viewerIsAdmin = viewer !== undefined && isAdmin(session, viewer.id)

	return {
		type: 'AdaptiveCard',
		version: '1.5',
		refresh: {
			action: execute('Refresh', { action: 'refresh', sessionId: session.id }),
			userIds: [...session.participants.values()].map(participant => participant.teamsId).slice(0, maxRefreshUsers),
		},
		body: [
			{ type: 'TextBlock', text: 'Estimate', size: 'Small', isSubtle: true, spacing: 'None' },
			{ type: 'TextBlock', text: topicMarkdown(session.topic), size: 'Large', weight: 'Bolder', wrap: true, spacing: 'None' },
			{ type: 'TextBlock', text: `${decks[session.deck].label} · started by ${admin?.name ?? 'someone'}`, isSubtle: true, wrap: true },
			...(session.revealed ? revealedVotes(session) : hiddenVotes(session, viewer)),
			...(viewerIsAdmin ? adminButtons(session) : []),
		],
	}
}

function hiddenVotes(session: Session, viewer: SessionUser | undefined): CardElement[] {
	const voters = [...session.votes.keys()].map(id => session.participants.get(id)?.name ?? 'Someone')
	const ownVote = viewer && session.votes.get(viewer.id)
	const values = [...decks[session.deck].cards.map(card => card.value), unsureVote]

	return [
		{
			type: 'TextBlock',
			text: voters.length === 0 ? 'Nobody has voted yet.' : `${String(voters.length)} voted: ${voters.join(', ')}`,
			wrap: true,
		},
		...(ownVote === undefined ? [] : [{ type: 'TextBlock' as const, text: `Your vote: ${ownVote}`, weight: 'Bolder' as const, spacing: 'Small' as const }]),
		...inRows(values, maxButtonsPerRow).map(row => ({
			type: 'ActionSet' as const,
			actions: row.map(value => execute(
				value,
				{ action: 'vote', sessionId: session.id, vote: value },
				value === ownVote ? 'positive' : undefined,
			)),
		})),
	]
}

function revealedVotes(session: Session): CardElement[] {
	const average = averageVote(session.deck, session.votes.values())

	return [
		session.votes.size === 0
			? { type: 'TextBlock', text: 'Nobody voted.', wrap: true }
			: {
				type: 'FactSet',
				facts: [...session.votes].map(([id, vote]) => ({ title: session.participants.get(id)?.name ?? 'Someone', value: vote })),
			},
		{ type: 'TextBlock', text: average === undefined ? 'No average: nobody voted a card.' : `Average: ${average}`, size: 'Large', weight: 'Bolder' },
	]
}

function adminButtons(session: Session): CardElement[] {
	const average = averageVote(session.deck, session.votes.values())
	const actions = session.revealed
		? [
			execute('Re-vote', { action: 'reset', sessionId: session.id }),
			execute(average === undefined ? 'Close' : `Accept ${average}`, { action: 'accept', sessionId: session.id }, 'positive'),
		]
		: [execute('Show votes', { action: 'reveal', sessionId: session.id }, 'positive')]

	return [
		{ type: 'TextBlock', text: 'Only you see these, because you started this estimate.', isSubtle: true, wrap: true, separator: true },
		{ type: 'ActionSet', actions },
	]
}

function execute(title: string, data: VoteCardAction, style?: 'positive'): IExecuteAction {
	return {
		type: 'Action.Execute',
		title,
		verb: data.action,
		data,
		...(style && { style }),
	}
}
