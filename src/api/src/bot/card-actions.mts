import { SessionRuleError, type SessionCard, type SessionUser } from '../sessions/session.mts'
import { expiredCard } from './cards/expired-card.mts'
import { readEstimateResult } from './cards/estimate-result.mts'
import { resultCard, voteCard, type VoteCardAction } from './cards/vote-card.mts'

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
const endedMessage = 'This estimate has ended, so it can\'t be re-voted. Send TVote a message to start a new one.'

/**
 * Handles a click on a vote card, or Teams asking for someone's own view of it (`refresh`).
 * `user` is who clicked, as Teams authenticated them, so the starter checks need nothing else.
 */
export function handleCardAction(sessions: SessionService, user: SessionUser, data: unknown): CardActionOutcome {
	const action = readCardAction(data)
	if (!action) return { reply: brokenCardMessage }

	const session = sessions.find(action.sessionId)
	if (!session) return sessionGone(action)

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
		}
	} catch (error) {
		if (error instanceof SessionRuleError) return { reply: error.message }
		throw error
	}
}

/**
 * The session expired, or the server restarted or slept. A revealed card keeps its result, everything else says it's over.
 * A refresh of a card without a result only changes that person's view: Teams asks for views all the time,
 * also for people who just scroll by, and a click will tell everyone soon enough.
 */
function sessionGone(action: VoteCardAction): CardActionOutcome {
	switch (action.action) {
		case 'refresh':
			// The result came along in the card's data. Putting it on the shared card drops the refresh, so this happens once.
			return action.result
				? { reply: resultCard(action.result), shared: resultCard(action.result) }
				: { reply: expiredCard() }
		case 'reset':
			// Only a revealed card has this button, and its result should stay.
			return { reply: endedMessage }
		case 'vote':
		case 'reveal':
			return { reply: expiredCard(), shared: expiredCard() }
	}
}

/** The card's data, checked: it comes from Teams, but the card could be old, or copied around. */
function readCardAction(data: unknown): VoteCardAction | undefined {
	if (typeof data !== 'object' || data === null) return undefined
	const { action, sessionId, vote, result } = data as Partial<Record<'action' | 'sessionId' | 'vote' | 'result', unknown>>
	if (typeof sessionId !== 'string' || sessionId === '') return undefined

	switch (action) {
		case 'vote':
			return typeof vote === 'string' ? { action, sessionId, vote } : undefined
		case 'refresh': {
			// A result that doesn't make sense is left out: the card then simply can't show it once the session is gone.
			const estimate = readEstimateResult(result)
			return estimate ? { action, sessionId, result: estimate } : { action, sessionId }
		}
		case 'reveal':
		case 'reset':
			return { action, sessionId }
		default:
			return undefined
	}
}
