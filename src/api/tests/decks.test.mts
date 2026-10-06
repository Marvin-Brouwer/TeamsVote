import { describe, expect, it } from 'vitest'

import { isValidVote, parseDeckId } from '../src/sessions/decks.mts'

describe('parseDeckId', () => {
	it.each([
		['fibonacci', 'fibonacci'],
		['T-Shirt', 't-shirt'],
		[' modified-fibonacci ', 'modified-fibonacci'],
		[undefined, 'modified-fibonacci'],
		['', 'modified-fibonacci'],
	])('reads %j as %j', (input, expected) => {
		// Act
		const deck = parseDeckId(input)

		// Assert
		expect(deck).toBe(expected)
	})

	it('refuses a deck that does not exist', () => {
		// Act
		const deck = parseDeckId('tarot')

		// Assert
		expect(deck).toBeUndefined()
	})
})

describe('isValidVote', () => {
	it('accepts t-shirt sizes by their label', () => {
		// Act
		const valid = isValidVote('t-shirt', 'XL')

		// Assert
		expect(valid).toBe(true)
	})

	it('refuses a card from another deck', () => {
		// Act
		const valid = isValidVote('fibonacci', '0.5')

		// Assert
		expect(valid).toBe(false)
	})

	it.each(['?', 'skip'])('accepts %j in every deck', vote => {
		// Act
		const valid = isValidVote('t-shirt', vote)

		// Assert
		expect(valid).toBe(true)
	})
})
