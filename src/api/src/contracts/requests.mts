import type { DeckId } from './decks.mts'

/** `POST /api/sessions/:id/vote` */
export type VoteRequest = {
	readonly vote: string
}

/** What the start dialog hands to `dialog.url.submit`, which Teams forwards to the bot. */
export type StartSubmission = {
	readonly action: 'start'
	readonly topic: string
	readonly deck: DeckId
}

/** What the admin's vote dialog hands to `dialog.url.submit` to accept the result. */
export type AcceptSubmission = {
	readonly action: 'accept'
	readonly sessionId: string
}

/** Sent by a vote dialog closing itself after the session ended. The bot doesn't need to do anything with it. */
export type CloseSubmission = {
	readonly action: 'close'
}

export type DialogSubmission = StartSubmission | AcceptSubmission | CloseSubmission

/** Development only: `POST /dev/sessions` and `POST /dev/sessions/:id/join`. */
export type DevelopmentJoinRequest = {
	readonly topic?: string
	readonly deck?: DeckId
	readonly user: { readonly id: string; readonly name: string }
}

export type DevelopmentJoinResponse = {
	readonly sessionId: string
	readonly token: string
}

export type ErrorResponse = {
	readonly error: string
}
