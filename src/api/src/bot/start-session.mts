import { isDeckId, type DeckId } from '../contracts/decks.mts'
import { maxTopicLength } from '../contracts/topic.mts'
import { cardMessage, type BotDependencies } from './bot-context.mts'
import { voteCard } from './cards/vote-card.mts'

import type { StartSubmission } from '../contracts/requests.mts'
import type { Session, SessionUser } from '../sessions/session.mts'
import type { MessageActivityInput, SentActivity } from '@microsoft/teams.api'

export type StartRequest = {
	readonly topic: string
	readonly deck: DeckId
	readonly admin: SessionUser
	readonly conversationId: string
	/** Sends into the conversation the request came from. */
	readonly send: (activity: MessageActivityInput) => Promise<SentActivity>
}

/** The bot couldn't post into the conversation, which almost always means it isn't installed there. */
export class NotInConversationError extends Error {
	constructor(cause: unknown) {
		super('TVote is not part of this conversation.', { cause })
		this.name = 'NotInConversationError'
	}
}

/** Starts a session and posts its vote card. Shared by the message extension and the mention command. */
export async function startSession({ sessions }: BotDependencies, request: StartRequest): Promise<Session> {
	const session = sessions.start({ topic: request.topic, deck: request.deck, admin: request.admin })

	let sent: SentActivity
	try {
		sent = await request.send(cardMessage(voteCard(session, request.admin)))
	} catch (error) {
		// Nobody can ever reach a session without a card, so don't keep it around.
		sessions.accept(session.id, request.admin.id)
		throw new NotInConversationError(error)
	}

	sessions.attachCard(session.id, { conversationId: request.conversationId, activityId: sent.id })
	return session
}

/** Checks what the start dialog submitted. It came through Teams, but the page that built it is ours to distrust. */
export function readStartSubmission(data: unknown): Pick<StartSubmission, 'topic' | 'deck'> | string {
	if (typeof data !== 'object' || data === null) return 'Nothing was submitted.'
	const { topic, deck } = data as Partial<Record<keyof StartSubmission, unknown>>

	if (typeof topic !== 'string' || topic.trim() === '') return 'Tell me what to estimate.'
	if (topic.length > maxTopicLength) return `Keep it under ${maxTopicLength} characters.`
	if (!isDeckId(deck)) return 'Pick a deck.'

	return { topic: topic.trim(), deck }
}
