import { castVote, resetVotes, reveal, SessionRuleError } from './session.mts'

import type { NewSession, SessionStore } from './session-store.mts'
import type { Session, SessionCard, SessionUser } from './session.mts'

/** Every change to a session goes through here. Sessions live in memory only, see `session-store.mts`. */
export function createSessionService(store: SessionStore) {
	function require(id: string): Session {
		const session = store.get(id)
		if (!session) throw new SessionRuleError(404, 'This vote has ended or expired.')
		return session
	}

	function change(id: string, apply: (session: Session) => void): Session {
		const session = require(id)
		apply(session)
		return session
	}

	return {
		start: (newSession: NewSession): Session => store.create(newSession),
		find: (id: string): Session | undefined => store.get(id),
		require,

		attachCard(id: string, card: SessionCard): void {
			require(id).card = card
		},

		vote: (id: string, user: SessionUser, vote: string) => change(id, session => {
			castVote(session, user, vote)
		}),
		reveal: (id: string, userId: string) => change(id, session => {
			reveal(session, userId)
		}),
		reset: (id: string, userId: string) => change(id, session => {
			resetVotes(session, userId)
		}),

		/** Forgets a session straight away, for one that never made it into the chat. */
		drop(id: string): void {
			store.delete(id)
		},

		/**
		 * Forgets every session that sat idle for too long. Their cards turn into the expired card on the next click,
		 * or keep their result when the votes were shown.
		 */
		expireIdle(): Session[] {
			const expired = store.sweep()
			for (const session of expired) session.ended = true
			return expired
		},
	}
}

export type SessionService = ReturnType<typeof createSessionService>
