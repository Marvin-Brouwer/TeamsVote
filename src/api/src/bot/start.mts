import { cardAttachment, type TaskModuleResponse } from '@microsoft/teams.api'

import { isDeckId, type DeckId } from '../sessions/decks.mts'
import { maxTopicLength } from '../sessions/topic.mts'
import { cardMessage, type BotDependencies } from './bot-context.mts'
import { startForm, type StartFormRetry } from './cards/start-form.mts'
import { voteCard } from './cards/vote-card.mts'

import type { Session, SessionUser } from '../sessions/session.mts'
import type { MessageActivityInput, SentActivity } from '@microsoft/teams.api'

export type StartRequest = {
	readonly topic: string
	readonly deck: DeckId
	readonly admin: SessionUser
	readonly conversationId: string
	/** Sends into the conversation the start came from. */
	readonly send: (activity: MessageActivityInput) => Promise<SentActivity>
}

/** "Start estimate" on the start card: the form, as a card dialog. */
export function openStartForm(retry?: StartFormRetry): TaskModuleResponse {
	return {
		task: {
			type: 'continue',
			value: {
				title: 'Start an estimate',
				card: cardAttachment('adaptive', startForm(retry)),
				width: 480,
				height: 320,
			},
		},
	}
}

/** Checks what the form sent. It came through Teams, but it's still what someone typed. */
export function readStartForm(data: unknown): Pick<StartRequest, 'topic' | 'deck'> | StartFormRetry {
	const { topic, deck } = typeof data === 'object' && data !== null
		? data as Partial<Record<'topic' | 'deck', unknown>>
		: {}
	const typedTopic = typeof topic === 'string' ? topic.trim() : ''
	const validDeck = isDeckId(deck) ? deck : undefined

	if (typedTopic === '') return { problem: 'Tell me what to estimate.', deck: validDeck }
	if (typedTopic.length > maxTopicLength) return { problem: `Keep it under ${String(maxTopicLength)} characters.`, topic: typedTopic, deck: validDeck }
	if (!validDeck) return { problem: 'Pick the cards to vote with.', topic: typedTopic }

	return { topic: typedTopic, deck: validDeck }
}

/** Starts a session and posts its vote card. When posting fails, the session goes too: nobody could reach it. */
export async function startSession({ sessions }: BotDependencies, request: StartRequest): Promise<Session> {
	const session = sessions.start({ topic: request.topic, deck: request.deck, admin: request.admin })
	try {
		const sent = await request.send(cardMessage(voteCard(session)))
		sessions.attachCard(session.id, { conversationId: request.conversationId, activityId: sent.id })
		return session
	} catch (error) {
		sessions.drop(session.id)
		throw error
	}
}
