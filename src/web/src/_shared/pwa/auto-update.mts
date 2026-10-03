import { applyUpdate, onUpdateReady } from '@rooted/pwa'

import { requestsInFlight } from '../api/api-client.mts'

/**
 * Takes a new version as soon as it's ready, instead of waiting for every window to close.
 * Teams keeps its webviews alive for a long time, so waiting would leave people on an old build for days.
 *
 * Reloading is safe here because nothing lives in the page: the session is on the server, and the reload
 * keeps the URL, token fragment included, so a vote dialog picks up where it was.
 * The one thing to wait for is a vote or admin request on its way, so it isn't cut off.
 */
export function keepUpToDate(): void {
	onUpdateReady(() => {
		if (requestsInFlight.value === 0) {
			void applyUpdate()
			return
		}

		const waiting = new AbortController()
		requestsInFlight.on('change', waiting.signal, ({ detail }) => {
			if (detail.state !== 0) return
			waiting.abort()
			void applyUpdate()
		})
	})
}
