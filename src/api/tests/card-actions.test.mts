import { describe, expect, it } from 'vitest'

import { handleCardAction } from '../src/bot/card-actions.mts'
import { createSessionService } from '../src/sessions/session-service.mts'
import { createSessionStore } from '../src/sessions/session-store.mts'

import type { IAdaptiveCard } from '@microsoft/teams.cards'

const admin = { id: 'admin', name: 'Ada', teamsId: '29:admin' }
const voter = { id: 'voter', name: 'Vic', teamsId: '29:voter' }

function arrangeSession() {
	const sessions = createSessionService(createSessionStore({ idleTimeoutMs: 1000 }))
	const session = sessions.start({ topic: 'PROJ-1', deck: 'modified-fibonacci', admin })
	sessions.attachCard(session.id, { conversationId: 'meeting-chat', activityId: 'card' })
	return { sessions, session }
}

function text(card: IAdaptiveCard | string | undefined): string {
	return JSON.stringify(card)
}

describe('clicking a vote', () => {
	it('records it, shows the voter their own view, and updates the card for everyone', () => {
		// Arrange
		const { sessions, session } = arrangeSession()

		// Act
		const outcome = handleCardAction(sessions, voter, { action: 'vote', sessionId: session.id, vote: '8' })

		// Assert
		expect(session.votes.get(voter.id)).toBe('8')
		expect(text(outcome.reply)).toContain('Your vote: 8')
		expect(text(outcome.shared)).toContain('1 voted: Vic')
		expect(text(outcome.shared)).not.toContain('Your vote')
		expect(outcome.at).toEqual({ conversationId: 'meeting-chat', activityId: 'card' })
	})
})

describe('the starter\'s buttons', () => {
	it('tell anyone else they can\'t, without changing the card', () => {
		// Arrange
		const { sessions, session } = arrangeSession()

		// Act
		const outcome = handleCardAction(sessions, voter, { action: 'reveal', sessionId: session.id })

		// Assert
		expect(outcome.reply).toBe('Only the person who started the vote can do this.')
		expect(outcome.shared).toBeUndefined()
		expect(session.revealed).toBe(false)
	})

	it('turn the card into the result on accept, for everyone', () => {
		// Arrange
		const { sessions, session } = arrangeSession()
		handleCardAction(sessions, voter, { action: 'vote', sessionId: session.id, vote: '8' })
		handleCardAction(sessions, admin, { action: 'reveal', sessionId: session.id })

		// Act
		const outcome = handleCardAction(sessions, admin, { action: 'accept', sessionId: session.id })

		// Assert
		expect(outcome.shared).toBe(outcome.reply)
		expect(text(outcome.shared)).toContain('"text":"8"')
		expect(sessions.find(session.id)).toBeUndefined()
	})
})

describe('a card whose vote is gone', () => {
	it('turns into the expired card on a click', () => {
		// Arrange
		const { sessions } = arrangeSession()

		// Act
		const outcome = handleCardAction(sessions, voter, { action: 'vote', sessionId: 'gone', vote: '8' })

		// Assert
		expect(text(outcome.reply)).toContain('This vote ended without a result.')
		expect(text(outcome.shared)).toContain('This vote ended without a result.')
	})

	it('only shows the expired card to whoever Teams refreshes it for', () => {
		// Arrange
		const { sessions } = arrangeSession()

		// Act
		const outcome = handleCardAction(sessions, voter, { action: 'refresh', sessionId: 'gone' })

		// Assert
		expect(text(outcome.reply)).toContain('This vote ended without a result.')
		expect(outcome.shared).toBeUndefined()
	})
})

describe('a card with data that makes no sense', () => {
	it.each([
		[undefined],
		[{ action: 'vote', sessionId: 'x' }],
		[{ action: 'dance', sessionId: 'x' }],
		[{ action: 'reveal' }],
	])('answers %j with a message', data => {
		// Arrange
		const { sessions } = arrangeSession()

		// Act
		const outcome = handleCardAction(sessions, voter, data)

		// Assert
		expect(typeof outcome.reply).toBe('string')
		expect(outcome.shared).toBeUndefined()
	})
})
