import { describe, expect, it } from 'vitest'

import { readStartForm, startSession, type StartRequest } from '../src/bot/start.mts'
import { createSessionService } from '../src/sessions/session-service.mts'
import { createSessionStore } from '../src/sessions/session-store.mts'

const admin = { id: 'admin', name: 'Ada', teamsId: '29:admin' }

describe('reading the start form', () => {
	it('takes a trimmed topic and a known deck', () => {
		// Act
		const form = readStartForm({ action: 'start', topic: '  PROJ-1 ', deck: 't-shirt' })

		// Assert
		expect(form).toEqual({ topic: 'PROJ-1', deck: 't-shirt' })
	})

	it.each([
		[{ topic: '', deck: 't-shirt' }, 'Tell me what to estimate.'],
		[{ topic: 'x'.repeat(301), deck: 't-shirt' }, 'Keep it under 300 characters.'],
		[{ topic: 'PROJ-1', deck: 'tarot' }, 'Pick the cards to vote with.'],
		[undefined, 'Tell me what to estimate.'],
	])('sends %j back with "%s"', (data, problem) => {
		// Act
		const form = readStartForm(data)

		// Assert
		expect(form).toMatchObject({ problem })
	})
})

describe('starting a session', () => {
	function arrangeStart(send: StartRequest['send']) {
		const sessions = createSessionService(createSessionStore({ idleTimeoutMs: 1000 }))
		const request: StartRequest = { topic: 'PROJ-1', deck: 'modified-fibonacci', admin, conversationId: 'meeting-chat', send }
		return { sessions, request }
	}

	it('posts the vote card and remembers where it is', async () => {
		// Arrange
		const { sessions, request } = arrangeStart(() => Promise.resolve({ id: 'card', type: 'message' }))

		// Act
		const session = await startSession({ sessions }, request)

		// Assert
		expect(sessions.find(session.id)?.card).toEqual({ conversationId: 'meeting-chat', activityId: 'card' })
	})

	it('drops the session when the card can\'t be posted', async () => {
		// Arrange
		const failure = new Error('Request failed with status code 403')
		let started: string | undefined
		const { sessions, request } = arrangeStart(() => Promise.reject(failure))
		const startSpy = sessions.start
		sessions.start = newSession => {
			const session = startSpy(newSession)
			started = session.id
			return session
		}

		// Act
		const attempt = startSession({ sessions }, request)

		// Assert
		await expect(attempt).rejects.toBe(failure)
		expect(started && sessions.find(started)).toBeUndefined()
	})
})
