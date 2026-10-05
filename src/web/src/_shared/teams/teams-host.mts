import { environment } from '@rooted/components'

import { trace } from '../diagnostics/trace.mts'
import { isTeamsTheme, themeStore } from '../theme/theme-store.mts'

import type { DialogSubmission } from '@t-vote/api/contracts'

/**
 * Where the page is running, and what it can hand back to Teams.
 * - `teams`: inside a Teams dialog.
 * - `development`: `vite dev` in a plain browser tab, with the bot faked by the API's /dev routes.
 * - `browser`: a plain browser tab in production. The Teams pages tell people to open them from Teams.
 */
export type TeamsHost = {
	readonly kind: 'teams' | 'development' | 'browser'
	/** Closes the dialog and hands the result to the bot. */
	readonly submit: (result: DialogSubmission) => void
}

// Long enough for a slow Teams client, short enough that a plain browser tab doesn't wait forever.
const initializeTimeoutMs = 8000

let connection: Promise<TeamsHost> | undefined

/**
 * Connects to Teams once, and hands back the same connection on every call after.
 * In the pre-render it never resolves: there's no Teams there, and the pre-rendered page should stay a spinner.
 */
export function connectTeams(): Promise<TeamsHost> {
	connection ??= connect()
	return connection
}

async function connect(): Promise<TeamsHost> {
	if (environment.is('preRenderer')) return await new Promise<never>(() => { /* Never: see connectTeams. */ })

	if (import.meta.env.DEV && window.parent === window) {
		const { developmentHost } = await import('./development-host.mts')
		return developmentHost()
	}

	const { app, dialog } = await import('@microsoft/teams-js')
	trace('Connecting to Teams')
	try {
		await withTimeout(app.initialize(), initializeTimeoutMs)
	} catch (error) {
		trace('Not inside Teams, or Teams did not answer', error)
		return { kind: 'browser', submit: () => { /* Nothing to submit to outside Teams. */ } }
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

	return {
		kind: 'teams',
		submit: result => {
			trace(`Submitting "${result.action}" to Teams`)
			dialog.url.submit(result)
		},
	}
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return Promise.race([
		promise,
		new Promise<never>((_resolve, reject) => setTimeout(() => {
			reject(new Error(`Timed out after ${ms}ms`))
		}, ms)),
	])
}
