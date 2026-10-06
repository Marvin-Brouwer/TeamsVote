import { averageVote } from '../../sessions/average.mts'
import { decks, skipVote, unsureVote } from '../../sessions/decks.mts'
import { isAdmin, type Session, type SessionUser } from '../../sessions/session.mts'
import { inRows } from './button-rows.mts'
import { estimateResult, type EstimateResult } from './estimate-result.mts'
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
	/** `result` is on revealed cards only, so they can still show it once the session is gone. */
	| { readonly action: 'refresh', readonly sessionId: string, readonly result?: EstimateResult }
	| { readonly action: 'reveal' | 'reset', readonly sessionId: string }

/**
 * The vote card. Without `viewer` it's the card everyone sees: who voted, never what.
 * With `viewer` it's that person's own view: their vote highlighted, and for whoever started it, the buttons to
 * show the votes and re-vote. Teams asks for the own views by itself, through `refresh`.
 *
 * Once the votes are shown, that's the estimate, unless the starter asks for a re-vote.
 */
export function voteCard(session: Session, viewer?: SessionUser): IAdaptiveCard {
	const viewerIsAdmin = viewer !== undefined && isAdmin(session, viewer.id)
	const result = session.revealed ? estimateResult(session) : undefined

	return {
		type: 'AdaptiveCard',
		version: '1.5',
		refresh: {
			action: execute('Refresh', { action: 'refresh', sessionId: session.id, ...(result && { result }) }),
			userIds: [...session.participants.values()].map(participant => participant.teamsId).slice(0, maxRefreshUsers),
		},
		body: [
			...header(estimateResult(session)),
			...(result ? resultBody(result) : hiddenVotes(session, viewer)),
			...(viewerIsAdmin ? adminButtons(session) : []),
		],
	}
}

/**
 * A revealed vote card once its session is gone: the same result, without buttons, and without a refresh,
 * so Teams stops asking for it.
 */
export function resultCard(result: EstimateResult): IAdaptiveCard {
	return {
		type: 'AdaptiveCard',
		version: '1.5',
		body: [...header(result), ...resultBody(result)],
	}
}

function header({ topic, deck, startedBy }: EstimateResult): CardElement[] {
	return [
		{ type: 'TextBlock', text: 'Estimate', size: 'Small', isSubtle: true, spacing: 'None' },
		{ type: 'TextBlock', text: topicMarkdown(topic), size: 'Large', weight: 'Bolder', wrap: true, spacing: 'None' },
		{ type: 'TextBlock', text: `${decks[deck].label} · started by ${startedBy}`, isSubtle: true, wrap: true },
	]
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

function resultBody({ deck, votes }: EstimateResult): CardElement[] {
	const values = votes.map(([, vote]) => vote)
	const average = averageVote(deck, values)

	return [
		votes.length === 0
			? { type: 'TextBlock', text: 'Nobody voted.', wrap: true }
			: { type: 'FactSet', facts: votes.map(([name, vote]) => ({ title: name, value: vote })) },
		...(average === undefined
			? [{ type: 'TextBlock' as const, text: 'Nobody voted a card, so there is no estimate.', wrap: true }]
			: [
				// On its own, so it's easy to select and copy: cards can't put anything on the clipboard themselves.
				{ type: 'TextBlock' as const, text: average, size: 'ExtraLarge' as const, weight: 'Bolder' as const, color: 'Accent' as const },
				{ type: 'TextBlock' as const, text: averageExplanation(values), isSubtle: true, wrap: true, spacing: 'None' as const },
			]),
	]
}

function averageExplanation(votes: readonly string[]): string {
	const counted = votes.filter(vote => vote !== unsureVote && vote !== skipVote).length
	return `Average of ${String(counted)} ${counted === 1 ? 'vote' : 'votes'}, rounded to the nearest card`
}

function adminButtons(session: Session): CardElement[] {
	const action = session.revealed
		? execute('Re-vote', { action: 'reset', sessionId: session.id })
		: execute('Show votes', { action: 'reveal', sessionId: session.id }, 'positive')

	return [
		{ type: 'TextBlock', text: 'Only you see this, because you started this estimate.', isSubtle: true, wrap: true, separator: true },
		{ type: 'ActionSet', actions: [action] },
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
