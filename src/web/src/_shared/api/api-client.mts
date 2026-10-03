import { createStore } from '@rooted/store'

import type { ErrorResponse, VoteRequest } from '@t-vote/api/contracts'

export const apiUrl = import.meta.env.VITE_API_URL

/** A request the API turned down. `message` is written for people, so it can be shown as-is. */
export class ApiError extends Error {
	constructor(readonly status: number, message: string) {
		super(message)
		this.name = 'ApiError'
	}
}

/**
 * How many requests that change something are on their way. The app only reloads onto a new version
 * when this is 0, so a vote can't get lost in the reload.
 */
export const requestsInFlight = createStore(0)

export async function apiRequest(path: string, init: RequestInit = {}): Promise<Response> {
	requestsInFlight.update(count => count + 1)
	try {
		const response = await fetch(`${apiUrl}${path}`, init)
		if (!response.ok) throw new ApiError(response.status, await errorMessage(response))
		return response
	} finally {
		requestsInFlight.update(count => count - 1)
	}
}

export async function errorMessage(response: Response): Promise<string> {
	try {
		const body = await response.json() as Partial<ErrorResponse>
		if (typeof body.error === 'string') return body.error
	} catch {
		// Not our JSON, fall through to the generic message.
	}
	return `The server answered ${response.status}. Please try again.`
}

/** The calls a vote dialog makes, all authorised by the session token the bot handed out. */
export function sessionClient(sessionId: string, token: string) {
	const base = `/api/sessions/${encodeURIComponent(sessionId)}`
	const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }

	return {
		sessionId,
		token,
		async vote(vote: string): Promise<void> {
			const body: VoteRequest = { vote }
			await apiRequest(`${base}/vote`, { method: 'POST', headers, body: JSON.stringify(body) })
		},
		async reveal(): Promise<void> {
			await apiRequest(`${base}/reveal`, { method: 'POST', headers })
		},
		async reset(): Promise<void> {
			await apiRequest(`${base}/reset`, { method: 'POST', headers })
		},
		eventsUrl: `${apiUrl}${base}/events`,
	}
}

export type SessionClient = ReturnType<typeof sessionClient>
