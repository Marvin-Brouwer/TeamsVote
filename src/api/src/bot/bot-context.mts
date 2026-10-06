import { MessageActivityInput, type Account } from '@microsoft/teams.api'

import type { SessionService } from '../sessions/session-service.mts'
import type { SessionUser } from '../sessions/session.mts'
import type { IAdaptiveCard } from '@microsoft/teams.cards'

/** What every bot handler needs. Built once in `server.mts`. */
export type BotDependencies = {
	readonly sessions: SessionService
}

/**
 * The person behind an activity. Microsoft authenticates bot activities, so this is the one identity we can trust.
 * The Entra object id is stable across chats; the Teams id is the fallback for the rare account without one.
 */
export function userFromActivity(from: Account): SessionUser {
	return {
		id: from.aadObjectId ?? from.id,
		name: nonEmpty(from.name?.trim()) ?? 'Someone',
		teamsId: from.id,
	}
}

/** A message holding only the given card, for sending and for replacing an earlier card. */
export function cardMessage(card: IAdaptiveCard): MessageActivityInput {
	return new MessageActivityInput().addCard('adaptive', card)
}

function nonEmpty(value: string | undefined): string | undefined {
	return value === '' ? undefined : value
}
