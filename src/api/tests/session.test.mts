import { describe, expect, it } from 'vitest'

import { createSessionService } from '../src/sessions/session-service.mts'
import { createSessionStore } from '../src/sessions/session-store.mts'
import { SessionRuleError } from '../src/sessions/session.mts'

const admin = { id: 'admin', name: 'Ada', teamsId: '29:admin' }
const voter = { id: 'voter', name: 'Vic', teamsId: '29:voter' }

function arrangeSession() {
	const service = createSessionService(createSessionStore({ idleTimeoutMs: 1000 }))
	const session = service.start({ topic: 'PROJ-1', deck: 'modified-fibonacci', admin })
	return { service, session }
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
	it('makes whoever votes a participant', () => {
		// Arrange
		const { service, session } = arrangeSession()

		// Act
		service.vote(session.id, voter, '5')

		// Assert
		expect(session.participants.get(voter.id)).toEqual(voter)
		expect(session.votes.get(voter.id)).toBe('5')
	})

	it('lets people change their vote until the reveal', () => {
		// Arrange
		const { service, session } = arrangeSession()
		service.vote(session.id, voter, '5')

		// Act
		service.vote(session.id, voter, '8')

		// Assert
		expect(session.votes.get(voter.id)).toBe('8')
	})

	it('refuses a value that is not in the deck', () => {
		// Arrange
		const { service, session } = arrangeSession()

		// Act
		const status = ruleStatus(() => service.vote(session.id, voter, 'XL'))

		// Assert
		expect(status).toBe(400)
	})

	it('only lets the admin reveal and reset', () => {
		// Arrange
		const { service, session } = arrangeSession()

		// Act
		const statuses = [
			ruleStatus(() => service.reveal(session.id, voter.id)),
			ruleStatus(() => service.reset(session.id, voter.id)),
		]

		// Assert
		expect(statuses).toEqual([403, 403])
	})

	it('refuses votes after the reveal until a re-vote', () => {
		// Arrange
		const { service, session } = arrangeSession()
		service.reveal(session.id, admin.id)

		// Act
		const whileRevealed = ruleStatus(() => service.vote(session.id, voter, '5'))
		service.reset(session.id, admin.id)
		const afterReset = ruleStatus(() => service.vote(session.id, voter, '5'))

		// Assert
		expect(whileRevealed).toBe(409)
		expect(afterReset).toBeUndefined()
	})

	it('forgets a dropped session', () => {
		// Arrange
		const { service, session } = arrangeSession()

		// Act
		service.drop(session.id)

		// Assert
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
