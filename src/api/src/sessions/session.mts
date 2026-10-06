import { averageVote } from './average.mts'
import { isValidVote, type DeckId } from './decks.mts'

export type SessionUser = {
	/** The Entra object id when Teams sends one, which is stable across chats. */
	readonly id: string
	readonly name: string
	/** The id Teams knows the user by in this chat (`29:…`), which is what a card's `refresh.userIds` needs. */
	readonly teamsId: string
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

/** A rule was broken. The message is meant for the person who broke it; `status` says what kind of rule. */
export class SessionRuleError extends Error {
	constructor(readonly status: 400 | 403 | 404 | 409, message: string) {
		super(message)
		this.name = 'SessionRuleError'
	}
}

export function isAdmin(session: Session, userId: string): boolean {
	return session.adminId === userId
}

/** Records a vote, or changes it. Voting is what makes someone a participant: there's no separate joining. */
export function castVote(session: Session, user: SessionUser, vote: string): void {
	assertOpen(session)
	if (session.revealed) throw new SessionRuleError(409, 'The votes are already shown. Ask for a re-vote first.')
	if (!isValidVote(session.deck, vote)) throw new SessionRuleError(400, `"${vote}" is not a card in this deck.`)

	session.participants.set(user.id, user)
	session.votes.set(user.id, vote)
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

function assertOpen(session: Session): void {
	if (session.ended) throw new SessionRuleError(409, 'This vote has already ended.')
}

function assertAdmin(session: Session, userId: string): void {
	if (!isAdmin(session, userId)) throw new SessionRuleError(403, 'Only the person who started the vote can do this.')
}
