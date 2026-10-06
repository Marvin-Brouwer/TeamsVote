import { SessionRuleError, type SessionCard, type SessionUser } from '../sessions/session.mts'
import { expiredCard } from './cards/expired-card.mts'
import { summaryCard } from './cards/summary-card.mts'
import { voteCard, type VoteCardAction } from './cards/vote-card.mts'

import type { SessionService } from '../sessions/session-service.mts'
import type { IAdaptiveCard } from '@microsoft/teams.cards'

/** What a click on the vote card comes to. */
export type CardActionOutcome = {
	/** What the person who clicked sees: their own view of the card, or a short message when they can't do that. */
	readonly reply: IAdaptiveCard | string
	/** The card everyone sees, when it changed. The bot puts it in place of the shared message. */
	readonly shared?: IAdaptiveCard
	/** Where the shared message is, when the session knows. Otherwise it's the message that was clicked. */
	readonly at?: SessionCard
}

const brokenCardMessage = 'This card doesn\'t work any more. Send TVote a message to start a new estimate.'

/**
 * Handles a click on a vote card, or Teams asking for someone's own view of it (`refresh`).
 * `user` is who clicked, as Teams authenticated them, so the starter checks need nothing else.
 */
export function handleCardAction(sessions: SessionService, user: SessionUser, data: unknown): CardActionOutcome {
	const action = readCardAction(data)
	if (!action) return { reply: brokenCardMessage }

	const session = sessions.find(action.sessionId)
	if (!session) {
		// Expired, or the server restarted. Say so on the card too, so nobody else tries.
		return action.action === 'refresh'
			? { reply: expiredCard() }
			: { reply: expiredCard(), shared: expiredCard() }
	}

	const at = session.card
	try {
		switch (action.action) {
			case 'refresh':
				return { reply: voteCard(session, user) }
			case 'vote':
				sessions.vote(session.id, user, action.vote)
				return { reply: voteCard(session, user), shared: voteCard(session), at }
			case 'reveal':
				sessions.reveal(session.id, user.id)
				return { reply: voteCard(session, user), shared: voteCard(session), at }
			case 'reset':
				sessions.reset(session.id, user.id)
				return { reply: voteCard(session, user), shared: voteCard(session), at }
			case 'accept': {
				const { average } = sessions.accept(session.id, user.id)
				const summary = summaryCard(session, average)
				return { reply: summary, shared: summary, at }
			}
		}
	} catch (error) {
		if (error instanceof SessionRuleError) return { reply: error.message }
		throw error
	}
}

/** The card's data, checked: it comes from Teams, but the card could be old, or copied around. */
function readCardAction(data: unknown): VoteCardAction | undefined {
	if (typeof data !== 'object' || data === null) return undefined
	const { action, sessionId, vote } = data as Partial<Record<'action' | 'sessionId' | 'vote', unknown>>
	if (typeof sessionId !== 'string' || sessionId === '') return undefined

	switch (action) {
		case 'vote':
			return typeof vote === 'string' ? { action, sessionId, vote } : undefined
		case 'refresh':
		case 'reveal':
		case 'reset':
		case 'accept':
			return { action, sessionId }
		default:
			return undefined
	}
}
