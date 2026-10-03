import { describe, expect, it } from 'vitest'

import { createSessionTokens } from '../src/auth/session-token.mts'

const secret = 'a-test-secret-that-is-long-enough-to-pass'
const claims = { sessionId: 'session-1', userId: 'user-1', userName: 'Ada' }

describe('session tokens', () => {
	it('gives back the claims it minted', async () => {
		// Arrange
		const tokens = createSessionTokens(secret)
		const token = await tokens.mint(claims)

		// Act
		const verified = await tokens.verify(token)

		// Assert
		expect(verified).toEqual(claims)
	})

	it('refuses a token signed with another secret', async () => {
		// Arrange
		const token = await createSessionTokens(`${secret}-other`).mint(claims)

		// Act
		const verified = await createSessionTokens(secret).verify(token)

		// Assert
		expect(verified).toBeUndefined()
	})

	it('refuses garbage', async () => {
		// Act
		const verified = await createSessionTokens(secret).verify('not.a.token')

		// Assert
		expect(verified).toBeUndefined()
	})

	it('refuses a secret that is too short', () => {
		// Act
		const create = () => createSessionTokens('short')

		// Assert
		expect(create).toThrow(/at least 32/)
	})
})
