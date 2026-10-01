/** `true` for the error a fetch (or anything else) throws when its signal aborts. */
export function isAbortError(error: unknown): boolean {
	return error instanceof DOMException && error.name === 'AbortError'
}
