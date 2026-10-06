import { isDeckId, type DeckId } from '../../sessions/decks.mts'

import type { Session } from '../../sessions/session.mts'

/**
 * What a revealed vote card shows, carried in the card's own refresh data.
 * Teams keeps asking for everyone's view of the card, also after the session is gone (expired, or the server
 * restarted or slept). With this the card can still show its result then, instead of losing it.
 */
export type EstimateResult = {
	readonly topic: string
	readonly deck: DeckId
	readonly startedBy: string
	/** Who voted what, in the order they first voted. */
	readonly votes: readonly (readonly [name: string, vote: string])[]
}

export function estimateResult(session: Session): EstimateResult {
	return {
		topic: session.topic,
		deck: session.deck,
		startedBy: session.participants.get(session.adminId)?.name ?? 'someone',
		votes: [...session.votes].map(([id, vote]) => [session.participants.get(id)?.name ?? 'Someone', vote] as const),
	}
}

/** The result from a card's data, checked: it comes back through Teams, but the card could be old, or copied around. */
export function readEstimateResult(data: unknown): EstimateResult | undefined {
	if (typeof data !== 'object' || data === null) return undefined
	const { topic, deck, startedBy, votes } = data as Partial<Record<keyof EstimateResult, unknown>>
	if (typeof topic !== 'string' || typeof startedBy !== 'string' || !isDeckId(deck) || !Array.isArray(votes)) return undefined
	if (!votes.every(isNamedVote)) return undefined
	return { topic, deck, startedBy, votes }
}

function isNamedVote(value: unknown): value is readonly [string, string] {
	return Array.isArray(value) && value.length === 2 && value.every(part => typeof part === 'string')
}
