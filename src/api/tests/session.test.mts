import { describe, expect, it } from 'vitest'

import { createSessionEvents } from '../src/sessions/session-events.mts'
import { createSessionService } from '../src/sessions/session-service.mts'
import { createSessionStore } from '../src/sessions/session-store.mts'
import { sessionView, SessionRuleError } from '../src/sessions/session.mts'

const admin = { id: 'admin', name: 'Ada' }
const voter = { id: 'voter', name: 'Vic' }

function arrangeSession() {
	const events = createSessionEvents()
	const service = createSessionService(createSessionStore({ idleTimeoutMs: 1000 }), events)
	const session = service.start({ topic: 'PROJ-1', deck: 'modified-fibonacci', admin })
	service.join(session.id, voter)
	return { service, events, session }
}

function ruleStatus(action: () => unknown): number | undefined {
	try {
		action()
		return undefined
	} catch (error) {
		if (error instanceof SessionRuleError) return error.status
		throw error
	}
}

describe('session rules', () => {
	it('hides other votes until they are revealed', () => {
		// Arrange
		const { service, session } = arrangeSession()
		service.vote(session.id, admin.id, '5')
		service.vote(session.id, voter.id, '8')

		// Act
		const view = sessionView(session, voter.id)

		// Assert
		expect(view.you.vote).toBe('8')
		expect(view.participants.map(participant => participant.vote)).toEqual([undefined, undefined])
		expect(view.participants.map(participant => participant.status)).toEqual(['voted', 'voted'])
		expect(view.average).toBeUndefined()
	})

	it('shows every vote and the average to everyone once revealed', () => {
		// Arrange
		const { service, session } = arrangeSession()
		service.vote(session.id, admin.id, '5')
		service.vote(session.id, voter.id, '8')

		// Act
		service.reveal(session.id, admin.id)
		const view = sessionView(session, voter.id)

		// Assert
		expect(view.participants.map(participant => participant.vote)).toEqual(['5', '8'])
		expect(view.average).toBe('5')
	})

	it('only lets the admin reveal, reset and accept', () => {
		// Arrange
		const { service, session } = arrangeSession()

		// Act
		const statuses = [
			ruleStatus(() => service.reveal(session.id, voter.id)),
			ruleStatus(() => service.reset(session.id, voter.id)),
			ruleStatus(() => service.accept(session.id, voter.id)),
		]

		// Assert
		expect(statuses).toEqual([403, 403, 403])
	})

	it('refuses votes from people who never opened the vote', () => {
		// Arrange
		const { service, session } = arrangeSession()

		// Act
		const status = ruleStatus(() => service.vote(session.id, 'stranger', '5'))

		// Assert
		expect(status).toBe(403)
	})

	it('refuses votes after the reveal until a re-vote', () => {
		// Arrange
		const { service, session } = arrangeSession()
		service.reveal(session.id, admin.id)

		// Act
		const whileRevealed = ruleStatus(() => service.vote(session.id, voter.id, '5'))
		service.reset(session.id, admin.id)
		const afterReset = ruleStatus(() => service.vote(session.id, voter.id, '5'))

		// Assert
		expect(whileRevealed).toBe(409)
		expect(afterReset).toBeUndefined()
	})

	it('ends, publishes and forgets the session on accept', () => {
		// Arrange
		const { service, events, session } = arrangeSession()
		service.vote(session.id, admin.id, '3')
		let published = 0
		events.subscribe(session.id, () => published++)

		// Act
		const { average } = service.accept(session.id, admin.id)

		// Assert
		expect(average).toBe('3')
		expect(published).toBe(1)
		expect(session.ended).toBe(true)
		expect(service.find(session.id)).toBeUndefined()
	})
})

describe('session store', () => {
	it('expires sessions that sat idle for too long', () => {
		// Arrange
		let now = 0
		const store = createSessionStore({ idleTimeoutMs: 1000, now: () => now })
		const idle = store.create({ topic: 'idle', deck: 'fibonacci', admin })
		const busy = store.create({ topic: 'busy', deck: 'fibonacci', admin })
		now = 900
		store.get(busy.id)
		now = 1500

		// Act
		const expired = store.sweep()

		// Assert
		expect(expired.map(session => session.id)).toEqual([idle.id])
		expect(store.size).toBe(1)
	})
})
