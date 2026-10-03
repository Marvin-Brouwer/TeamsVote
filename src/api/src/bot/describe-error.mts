// Teams' error bodies are short, but don't let an unexpected one flood the log.
const maxResponseLength = 500

/**
 * Something that went wrong, as text for the log: the stack, plus what Teams answered when it was a failed request.
 * Never log the error object itself. The Teams SDK sends with axios, and an axios error serializes its whole request,
 * the bot's `Authorization: Bearer …` header included.
 */
export function describeError(error: unknown): string {
	if (!(error instanceof Error)) return String(error)

	const lines = [error.stack ?? `${error.name}: ${error.message}`]
	if ('response' in error) lines.push(describeResponse(error.response))
	return lines.join('\n')
}

function describeResponse(response: unknown): string {
	if (typeof response !== 'object' || response === null) return 'No response'
	const status = 'status' in response ? String(response.status) : 'unknown status'
	const body = 'data' in response ? JSON.stringify(response.data) : ''
	return `Response ${status}: ${body.slice(0, maxResponseLength)}`
}
