const loadedAt = performance.now()

/**
 * A step on the way to a working dialog, in the browser console, prefixed with `[TVote]` and the time since the page
 * loaded. Only what happened: no names, ids or tokens. In Teams on the web, filter the DevTools console on `[TVote]`,
 * or pick this page's frame in the console's context dropdown.
 */
export function trace(step: string, error?: unknown): void {
	const message = `[TVote] ${String(Math.round(performance.now() - loadedAt))}ms ${step}`
	if (error === undefined) console.info(message)
	else console.warn(message, error)
}

/** Errors nothing else caught. In a Teams dialog these otherwise only show up as "can't reach the app". */
export function traceUncaughtErrors(): void {
	window.addEventListener('error', event => {
		trace('Uncaught error', event.error ?? event.message)
	})
	window.addEventListener('unhandledrejection', event => {
		trace('Unhandled rejection', event.reason)
	})
}
