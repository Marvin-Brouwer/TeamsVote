import { accept, castVote, join, resetVotes, reveal, SessionRuleError } from './session.mts'

import type { SessionEvents } from './session-events.mts'
import type { NewSession, SessionStore } from './session-store.mts'
import type { Session, SessionCard, SessionUser } from './session.mts'

export type AcceptedSession = {
	readonly session: Session
	readonly average: string | undefined
}

/**
 * Everything that changes a session goes through here, so every change is published to whoever is watching.
 * Used by both the HTTP routes and the bot.
 */
export function createSessionService(store: SessionStore, events: SessionEvents) {
	function require(id: string): Session {
		const session = store.get(id)
		if (!session) throw new SessionRuleError(404, 'This vote has ended or expired.')
		return session
	}

	function change(id: string, apply: (session: Session) => void): Session {
		const session = require(id)
		apply(session)
		events.publish(id)
		return session
	}

	return {
		start: (newSession: NewSession): Session => store.create(newSession),
		find: (id: string): Session | undefined => store.get(id),
		require,

		attachCard(id: string, card: SessionCard): void {
			require(id).card = card
		},

		join: (id: string, user: SessionUser) => change(id, session => join(session, user)),
		vote: (id: string, userId: string, vote: string) => change(id, session => castVote(session, userId, vote)),
		reveal: (id: string, userId: string) => change(id, session => reveal(session, userId)),
		reset: (id: string, userId: string) => change(id, session => resetVotes(session, userId)),

		/** Ends the session for good: everyone watching gets the final state, then it's forgotten. */
		accept(id: string, userId: string): AcceptedSession {
			const session = require(id)
			const average = accept(session, userId)
			events.publish(id)
			store.delete(id)
			return { session, average }
		},

		/** Ends and forgets every session that sat idle for too long. */
		expireIdle(): Session[] {
			const expired = store.sweep()
			for (const session of expired) {
				session.ended = true
				events.publish(session.id)
			}
			return expired
		},
	}
}

export type SessionService = ReturnType<typeof createSessionService>
