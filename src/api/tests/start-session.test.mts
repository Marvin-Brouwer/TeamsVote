import { describe, expect, it } from 'vitest'

import { installCard, isAfterInstall } from '../src/bot/cards/install-card.mts'
import { NotInConversationError, readStartSubmission, startSession } from '../src/bot/start-session.mts'
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

describe('the install card', () => {
	const submission = { topic: 'PROJ-1', deck: 't-shirt' } as const

	function buttonData(): unknown {
		const action = installCard(submission).actions?.[0]
		return action && 'data' in action ? action.data : undefined
	}

	it('carries the topic and deck through the install, for the submit Teams sends after it', () => {
		expect(readStartSubmission(buttonData())).toEqual(submission)
	})

	it('marks that submit as coming back from an install', () => {
		expect(isAfterInstall(buttonData())).toBe(true)
	})

	it('does not mistake a plain start for one', () => {
		expect(isAfterInstall({ action: 'start', ...submission })).toBe(false)
		expect(isAfterInstall({ msteams: {} })).toBe(false)
		expect(isAfterInstall(undefined)).toBe(false)
	})
})
