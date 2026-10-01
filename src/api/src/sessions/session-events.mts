type Listener = () => void

/**
 * Who is watching which session. Listeners get no payload: each one builds its own view,
 * because what a participant may see depends on who they are.
 */
export function createSessionEvents() {
	const listeners = new Map<string, Set<Listener>>()

	return {
		/** Returns the function that stops listening. */
		subscribe(sessionId: string, listener: Listener): () => void {
			let sessionListeners = listeners.get(sessionId)
			if (!sessionListeners) {
				sessionListeners = new Set()
				listeners.set(sessionId, sessionListeners)
			}
			sessionListeners.add(listener)

			return () => {
				sessionListeners.delete(listener)
				if (sessionListeners.size === 0) listeners.delete(sessionId)
			}
		},

		publish(sessionId: string): void {
			for (const listener of listeners.get(sessionId) ?? []) listener()
		},

		subscriberCount(sessionId: string): number {
			return listeners.get(sessionId)?.size ?? 0
		},
	}
}

export type SessionEvents = ReturnType<typeof createSessionEvents>
