import { environment } from '@rooted/components'

import { trace } from '../diagnostics/trace.mts'
import { isTeamsTheme, themeStore } from '../theme/theme-store.mts'

/**
 * Where the page is running.
 * - `teams`: inside Teams, as the meeting tab or its configuration page.
 * - `browser`: anywhere else, like a plain browser tab or `vite dev`.
 */
export type TeamsHost = {
	readonly kind: 'teams' | 'browser'
}

// Long enough for a slow Teams client, short enough that a plain browser tab doesn't wait forever.
const initializeTimeoutMs = 8000

let connection: Promise<TeamsHost> | undefined

/**
 * Connects to Teams once, and hands back the same connection on every call after.
 * In the pre-render it never resolves: there's no Teams there.
 */
export function connectTeams(): Promise<TeamsHost> {
	connection ??= connect()
	return connection
}

async function connect(): Promise<TeamsHost> {
	if (environment.is('preRenderer')) return await new Promise<never>(() => { /* Never: see connectTeams. */ })

	const { app } = await import('@microsoft/teams-js')
	trace('Connecting to Teams')
	try {
		await withTimeout(app.initialize(), initializeTimeoutMs)
	} catch (error) {
		trace('Not inside Teams, or Teams did not answer', error)
		return { kind: 'browser' }
	}
	trace('Connected to Teams')

	const { theme } = (await app.getContext()).app
	if (isTeamsTheme(theme)) themeStore.update(() => theme)
	app.registerOnThemeChangeHandler(changed => {
		if (isTeamsTheme(changed)) themeStore.update(() => changed)
	})
	document.documentElement.dataset.host = 'teams'
	// Teams shows its own loading indicator until we say we're ready, and gives up with "can't reach the app" if we never do.
	try {
		await app.notifySuccess()
		trace('Told Teams the page is ready')
	} catch (error) {
		trace('Could not tell Teams the page is ready', error)
	}

	return { kind: 'teams' }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return Promise.race([
		promise,
		new Promise<never>((_resolve, reject) => setTimeout(() => {
			reject(new Error(`Timed out after ${ms}ms`))
		}, ms)),
	])
}
