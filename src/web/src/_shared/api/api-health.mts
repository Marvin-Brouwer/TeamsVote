import { isAbortError } from './abort.mts'
import { apiUrl } from './api-client.mts'

const retryDelayMs = 2000

/**
 * Resolves once the API answers. On Render's free tier the first request after a quiet spell
 * starts the server, which can take close to a minute; Render holds the request until it's up.
 * Network errors along the way are retried until `signal` aborts.
 */
export async function waitForApi(signal: AbortSignal): Promise<void> {
	while (!signal.aborted) {
		try {
			const response = await fetch(`${apiUrl}/health`, { signal, cache: 'no-store' })
			if (response.ok) return
		} catch (error) {
			if (isAbortError(error)) throw error
		}
		await delay(retryDelayMs, signal)
	}
	signal.throwIfAborted()
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
	return new Promise(resolve => {
		const timer = setTimeout(resolve, ms)
		signal.addEventListener('abort', () => {
			clearTimeout(timer)
			resolve()
		}, { once: true })
	})
}
