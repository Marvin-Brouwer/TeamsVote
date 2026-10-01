import { isValidVote, type DeckId } from '../contracts/decks.mts'
import { averageVote } from './average.mts'

import type { SessionView } from '../contracts/session-view.mts'

export type SessionUser = {
	readonly id: string
	readonly name: string
}

/** Where the vote card lives, so the bot can replace it with the summary later. */
export type SessionCard = {
	readonly conversationId: string
	readonly activityId: string
}

/** A voting round. Lives in memory only, see `session-store.mts`. */
export type Session = {
	readonly id: string
	readonly topic: string
	readonly deck: DeckId
	readonly adminId: string
	readonly participants: Map<string, SessionUser>
	readonly votes: Map<string, string>
	card?: SessionCard
	revealed: boolean
	ended: boolean
	lastActivity: number
}

/** A rule was broken. `status` is the HTTP status the API answers with. */
export class SessionRuleError extends Error {
	constructor(readonly status: 400 | 403 | 404 | 409, message: string) {
		super(message)
		this.name = 'SessionRuleError'
	}
}

export function isAdmin(session: Session, userId: string): boolean {
	return session.adminId === userId
}

/** Adds someone to the participant list, or refreshes their name when they're already on it. */
export function join(session: Session, user: SessionUser): void {
	assertOpen(session)
	session.participants.set(user.id, user)
}

export function castVote(session: Session, userId: string, vote: string): void {
	assertOpen(session)
	assertParticipant(session, userId)
	if (session.revealed) throw new SessionRuleError(409, 'The scores are already revealed. Ask for a re-vote first.')
	if (!isValidVote(session.deck, vote)) throw new SessionRuleError(400, `"${vote}" is not a card in this deck.`)

	session.votes.set(userId, vote)
}

export function reveal(session: Session, userId: string): void {
	assertOpen(session)
	assertAdmin(session, userId)
	session.revealed = true
}

/** Clears every vote and hides the scores again. */
export function resetVotes(session: Session, userId: string): void {
	assertOpen(session)
	assertAdmin(session, userId)
	session.votes.clear()
	session.revealed = false
}

/** Ends the session and gives back the average, so the bot can put it on the summary card. */
export function accept(session: Session, userId: string): string | undefined {
	assertOpen(session)
	assertAdmin(session, userId)
	session.ended = true
	session.revealed = true
	return averageVote(session.deck, session.votes.values())
}

export function sessionView(session: Session, userId: string): SessionView {
	const ownVote = session.votes.get(userId)
	return {
		id: session.id,
		topic: session.topic,
		deck: session.deck,
		revealed: session.revealed,
		ended: session.ended,
		participants: [...session.participants.values()].map(participant => {
			const vote = session.votes.get(participant.id)
			return {
				id: participant.id,
				name: participant.name,
				admin: isAdmin(session, participant.id),
				status: vote === undefined ? 'pending' : 'voted',
				...(session.revealed && vote !== undefined && { vote }),
			}
		}),
		...(session.revealed && { average: averageVote(session.deck, session.votes.values()) }),
		you: {
			id: userId,
			admin: isAdmin(session, userId),
			...(ownVote !== undefined && { vote: ownVote }),
		},
	}
}

function assertOpen(session: Session): void {
	if (session.ended) throw new SessionRuleError(409, 'This vote has already ended.')
}

function assertParticipant(session: Session, userId: string): void {
	if (!session.participants.has(userId)) throw new SessionRuleError(403, 'You are not part of this vote.')
}

function assertAdmin(session: Session, userId: string): void {
	if (!isAdmin(session, userId)) throw new SessionRuleError(403, 'Only the person who started the vote can do this.')
}
