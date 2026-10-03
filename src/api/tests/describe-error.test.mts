import { describe, expect, it } from 'vitest'

import { describeError } from '../src/bot/describe-error.mts'

// Shaped like what the Teams SDK throws: an axios error, carrying the request it made and the response it got.
function failedRequest() {
	return Object.assign(new Error('Request failed with status code 403'), {
		config: { headers: { Authorization: 'Bearer secret-token' } },
		request: { headers: { authorization: 'Bearer secret-token' } },
		response: {
			status: 403,
			data: { error: { code: 'BotNotInConversationRoster', message: 'The bot is not part of the conversation roster.' } },
			config: { headers: { Authorization: 'Bearer secret-token' } },
		},
	})
}

describe('describing an error for the log', () => {
	it('never includes the request, so never the bot\'s token', () => {
		expect(describeError(failedRequest())).not.toContain('secret-token')
	})

	it('includes what Teams answered', () => {
		const description = describeError(failedRequest())

		expect(description).toContain('Response 403')
		expect(description).toContain('BotNotInConversationRoster')
	})

	it('keeps the stack', () => {
		expect(describeError(failedRequest())).toContain('Request failed with status code 403')
	})

	it('copes with things that aren\'t errors', () => {
		expect(describeError('plain text')).toBe('plain text')
	})
})
