import { randomUUID } from 'node:crypto'

import type { DeckId } from '../contracts/decks.mts'
import type { Session, SessionUser } from './session.mts'

export type SessionStoreOptions = {
	/** How long a session may sit untouched before it's thrown away. */
	readonly idleTimeoutMs: number
	readonly now?: () => number
}

export type NewSession = {
	readonly topic: string
	readonly deck: DeckId
	readonly admin: SessionUser
}

/**
 * Keeps sessions in memory, and nowhere else. A restart loses them all, which is the point:
 * nothing about a vote outlives it.
 */
export function createSessionStore({ idleTimeoutMs, now = Date.now }: SessionStoreOptions) {
	const sessions = new Map<string, Session>()

	return {
		create({ topic, deck, admin }: NewSession): Session {
			const session: Session = {
				id: randomUUID(),
				topic,
				deck,
				adminId: admin.id,
				participants: new Map([[admin.id, admin]]),
				votes: new Map(),
				revealed: false,
				ended: false,
				lastActivity: now(),
			}
			sessions.set(session.id, session)
			return session
		},

		/** Looks a session up and counts it as activity, so it doesn't expire while people use it. */
		get(id: string): Session | undefined {
			const session = sessions.get(id)
			if (session) session.lastActivity = now()
			return session
		},

		delete(id: string): void {
			sessions.delete(id)
		},

		/** Removes every session that has been idle for too long, and hands them back so they can be closed properly. */
		sweep(): Session[] {
			const expired: Session[] = []
			for (const session of sessions.values()) {
				if (now() - session.lastActivity < idleTimeoutMs) continue
				sessions.delete(session.id)
				expired.push(session)
			}
			return expired
		},

		get size(): number {
			return sessions.size
		},
	}
}

export type SessionStore = ReturnType<typeof createSessionStore>
