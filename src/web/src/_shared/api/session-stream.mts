import { sessionStateEvent, type SessionView } from '@teams-vote/api/contracts'

import { isAbortError } from './abort.mts'
import { ApiError, errorMessage, type SessionClient } from './api-client.mts'

export type SessionStreamHandlers = {
	/** Every state the server sends, starting with the current one. */
	readonly onState: (view: SessionView) => void
	/** `false` while the connection is down and being retried. */
	readonly onConnectionChange: (connected: boolean) => void
	/** The server said no for good: the token expired, or the session is gone. No more retries. */
	readonly onRejected: (error: ApiError) => void
}

const maxRetryDelayMs = 15_000

/**
 * Follows the session's server-sent events until it ends or `signal` aborts.
 * Uses `fetch` rather than `EventSource`, because `EventSource` can't send the Authorization header
 * and a token in the query string would end up in server logs.
 */
export async function followSession(client: SessionClient, signal: AbortSignal, handlers: SessionStreamHandlers): Promise<void> {
	let failures = 0

	while (!signal.aborted) {
		try {
			const response = await fetch(client.eventsUrl, {
				headers: {
					Authorization: `Bearer ${client.token}`,
				},
				cache: 'no-store',
				signal,
			})
			if (response.status === 401 || response.status === 403 || response.status === 404) {
				handlers.onRejected(new ApiError(response.status, await errorMessage(response)))
				return
			}
			if (!response.ok || !response.body) throw new ApiError(response.status, await errorMessage(response))

			failures = 0
			handlers.onConnectionChange(true)
			for await (const event of readServerSentEvents(response.body)) {
				if (event.name !== sessionStateEvent) continue
				const view = JSON.parse(event.data) as SessionView
				handlers.onState(view)
				if (view.ended) return
			}
		} catch (error) {
			if (isAbortError(error)) return
		}

		handlers.onConnectionChange(false)
		failures++
		await delay(Math.min(1000 * 2 ** failures, maxRetryDelayMs), signal)
	}
}

type ServerSentEvent = {
	readonly name: string
	readonly data: string
}

async function* readServerSentEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<ServerSentEvent> {
	const reader = body.getReader()
	const decoder = new TextDecoder()
	let buffer = ''
	try {
		for (;;) {
			const { done, value } = await reader.read()
			if (done) return
			buffer += decoder.decode(value, {
				stream: true,
			})

			let boundary = buffer.indexOf('\n\n')
			while (boundary !== -1) {
				const event = parseEvent(buffer.slice(0, boundary))
				buffer = buffer.slice(boundary + 2)
				if (event) yield event
				boundary = buffer.indexOf('\n\n')
			}
		}
	} finally {
		reader.releaseLock()
	}
}

function parseEvent(block: string): ServerSentEvent | undefined {
	let name = 'message'
	const data: string[] = []
	for (const line of block.split('\n')) {
		// Lines starting with a colon are comments, the server sends those as heartbeats.
		if (line.startsWith(':')) continue
		if (line.startsWith('event:')) name = line.slice('event:'.length).trim()
		if (line.startsWith('data:')) data.push(line.slice('data:'.length).trimStart())
	}
	if (data.length === 0) return undefined
	return {
		name,
		data: data.join('\n'),
	}
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
	return new Promise(resolve => {
		const timer = setTimeout(resolve, ms)
		signal.addEventListener('abort', () => {
			clearTimeout(timer)
			resolve()
		}, {
			once: true,
		})
	})
}
