export type RecentInstallsOptions = {
	/** How long an install counts as recent. */
	readonly windowMs: number
	readonly now?: () => number
}

/**
 * The conversations TVote was added to a moment ago. Right after a just-in-time install, Teams sends the start again,
 * but posting into the conversation can still be refused for a little while. Kept in memory, ids only.
 */
export function createRecentInstalls({ windowMs, now = Date.now }: RecentInstallsOptions) {
	const installedAt = new Map<string, number>()

	function forgetOld() {
		for (const [conversationId, at] of installedAt) {
			if (now() - at > windowMs) installedAt.delete(conversationId)
		}
	}

	return {
		add(conversationId: string): void {
			forgetOld()
			installedAt.set(conversationId, now())
		},
		has(conversationId: string): boolean {
			forgetOld()
			return installedAt.has(conversationId)
		},
	}
}

export type RecentInstalls = ReturnType<typeof createRecentInstalls>
