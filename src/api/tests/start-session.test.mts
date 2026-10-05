import { describe, expect, it } from 'vitest'

import { isFromStartDialog, NotInConversationError, startSession, startSessionAfterInstall } from '../src/bot/start-session.mts'
import { createSessionEvents } from '../src/sessions/session-events.mts'
import { createSessionService } from '../src/sessions/session-service.mts'
import { createSessionStore } from '../src/sessions/session-store.mts'

import type { StartRequest } from '../src/bot/start-session.mts'

const admin = { id: 'admin', name: 'Ada' }

function arrangeStart(send: StartRequest['send']) {
	const service = createSessionService(createSessionStore({ idleTimeoutMs: 1000 }), createSessionEvents())
	const startedIds: string[] = []
	const sessions = {
		...service,
		start: (...parameters: Parameters<typeof service.start>) => {
			const session = service.start(...parameters)
			startedIds.push(session.id)
			return session
		},
	}
	const request: StartRequest = {
		topic: 'PROJ-1',
		deck: 'modified-fibonacci',
		admin,
		conversationId: 'conversation',
		send,
	}
	return { service, sessions, startedIds, request }
}

// What the Teams SDK throws when Teams answers with an error: an axios error carrying the response.
function responseError(status: number): Error {
	return Object.assign(new Error(`Request failed with status code ${status}`), { response: { status } })
}

describe('starting a session', () => {
	it('attaches the posted card to the session', async () => {
		const { sessions, service, request } = arrangeStart(() => Promise.resolve({ id: 'activity', type: 'message' }))

		const session = await startSession({ sessions }, request)

		expect(service.find(session.id)?.card).toEqual({ conversationId: 'conversation', activityId: 'activity' })
	})

	it('reports a 403 as not being in the conversation, and drops the session', async () => {
		const { sessions, service, startedIds, request } = arrangeStart(() => Promise.reject(responseError(403)))

		await expect(startSession({ sessions }, request)).rejects.toBeInstanceOf(NotInConversationError)
		expect(service.find(startedIds[0]!)).toBeUndefined()
	})

	it('passes any other failure on as it is, and drops the session', async () => {
		const failure = responseError(500)
		const { sessions, service, startedIds, request } = arrangeStart(() => Promise.reject(failure))

		await expect(startSession({ sessions }, request)).rejects.toBe(failure)
		expect(service.find(startedIds[0]!)).toBeUndefined()
	})
})

describe('starting a session right after an install', () => {
	it('tries again while Teams still refuses the card', async () => {
		let attempts = 0
		const { sessions, request } = arrangeStart(() => {
			attempts++
			return attempts < 3 ? Promise.reject(responseError(403)) : Promise.resolve({ id: 'activity', type: 'message' })
		})

		const session = await startSessionAfterInstall({ sessions }, request, [0, 0, 0])

		expect(attempts).toBe(3)
		expect(session.card?.activityId).toBe('activity')
	})

	it('gives up after the last delay', async () => {
		let attempts = 0
		const { sessions, request } = arrangeStart(() => {
			attempts++
			return Promise.reject(responseError(403))
		})

		await expect(startSessionAfterInstall({ sessions }, request, [0, 0])).rejects.toBeInstanceOf(NotInConversationError)
		expect(attempts).toBe(3)
	})

	it('does not retry other failures', async () => {
		let attempts = 0
		const { sessions, request } = arrangeStart(() => {
			attempts++
			return Promise.reject(responseError(500))
		})

		await expect(startSessionAfterInstall({ sessions }, request, [0, 0])).rejects.not.toBeInstanceOf(NotInConversationError)
		expect(attempts).toBe(1)
	})
})

describe('telling the start dialog apart from the install button', () => {
	it('knows the start dialog by its action', () => {
		expect(isFromStartDialog({ action: 'start', topic: 'PROJ-1', deck: 't-shirt' })).toBe(true)
	})

	it('takes anything else for the install button', () => {
		expect(isFromStartDialog({ msteams: { justInTimeInstall: true } })).toBe(false)
		expect(isFromStartDialog({})).toBe(false)
		expect(isFromStartDialog(undefined)).toBe(false)
	})
})
