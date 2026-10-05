import { setTimeout as delay } from 'node:timers/promises'

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

/** Teams refused the vote card with a 403: the bot isn't installed in that conversation. */
export class NotInConversationError extends Error {
	constructor(cause: unknown) {
		super('TVote is not part of this conversation.', { cause })
		this.name = 'NotInConversationError'
	}
}

/** Starts a session and posts its vote card. Shared by the message extension and the mention command. */
export async function startSession({ sessions }: Pick<BotDependencies, 'sessions'>, request: StartRequest): Promise<Session> {
	const session = sessions.start({ topic: request.topic, deck: request.deck, admin: request.admin })

	let sent: SentActivity
	try {
		sent = await request.send(cardMessage(voteCard(session, request.admin)))
	} catch (error) {
		// Nobody can ever reach a session without a card, so don't keep it around.
		sessions.accept(session.id, request.admin.id)
		throw isForbidden(error) ? new NotInConversationError(error) : error
	}

	sessions.attachCard(session.id, { conversationId: request.conversationId, activityId: sent.id })
	return session
}

/**
 * `startSession` for a conversation TVote was added to a moment ago. Teams can refuse the card for a little while after
 * the install, so a 403 is tried again after each of the given delays before it counts.
 */
export async function startSessionAfterInstall(dependencies: Pick<BotDependencies, 'sessions'>, request: StartRequest, retryDelaysMs: readonly number[]): Promise<Session> {
	for (const delayMs of retryDelaysMs) {
		try {
			return await startSession(dependencies, request)
		} catch (error) {
			if (!(error instanceof NotInConversationError)) throw error
			await delay(delayMs)
		}
	}
	return await startSession(dependencies, request)
}

/** Whether Teams refused a request with a 403. The Teams SDK sends with axios, whose errors carry the response; checked by shape. */
export function isForbidden(error: unknown): boolean {
	if (typeof error !== 'object' || error === null || !('response' in error)) return false
	const { response } = error
	return typeof response === 'object' && response !== null && 'status' in response && response.status === 403
}

/** Whether a message extension submit comes from the start dialog, rather than from the install card's button. */
export function isFromStartDialog(data: unknown): boolean {
	return typeof data === 'object' && data !== null && 'action' in data && data.action === 'start'
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
