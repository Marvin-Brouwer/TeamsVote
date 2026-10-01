import type { DeckId } from './decks.mts'

export type ParticipantStatus = 'pending' | 'voted'

export type ParticipantView = {
	readonly id: string
	readonly name: string
	readonly admin: boolean
	readonly status: ParticipantStatus
	/** Only filled in once the scores are revealed. */
	readonly vote?: string
}

/**
 * The state of a session as one participant sees it.
 * Votes stay hidden until the admin reveals them, except for your own.
 */
export type SessionView = {
	readonly id: string
	readonly topic: string
	readonly deck: DeckId
	readonly revealed: boolean
	readonly ended: boolean
	readonly participants: readonly ParticipantView[]
	/** The average rounded to the nearest card. Only filled in once revealed, and only when anyone voted a card. */
	readonly average?: string
	readonly you: {
		readonly id: string
		readonly admin: boolean
		readonly vote?: string
	}
}

/** The name of the server-sent event that carries a {@link SessionView}. */
export const sessionStateEvent = 'state'
