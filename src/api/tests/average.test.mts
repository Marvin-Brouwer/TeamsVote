import { describe, expect, it } from 'vitest'

import { averageVote } from '../src/sessions/average.mts'

describe('averageVote', () => {
	it('rounds to the nearest card in the deck', () => {
		// Arrange
		const votes = ['3', '5', '8']

		// Act
		const average = averageVote('modified-fibonacci', votes)

		// Assert
		expect(average).toBe('5')
	})

	it('picks the lower card on a tie', () => {
		// Arrange
		const votes = ['2', '3']

		// Act
		const average = averageVote('fibonacci', votes)

		// Assert
		expect(average).toBe('2')
	})

	it('ignores unsure, skipped and unknown votes', () => {
		// Arrange
		const votes = ['?', 'skip', '13', '999']

		// Act
		const average = averageVote('modified-fibonacci', votes)

		// Assert
		expect(average).toBe('13')
	})

	it('has no average when nobody voted a card', () => {
		// Arrange
		const votes = ['?', 'skip']

		// Act
		const average = averageVote('modified-fibonacci', votes)

		// Assert
		expect(average).toBeUndefined()
	})

	it('averages t-shirt sizes by their weight and answers with a size', () => {
		// Arrange
		const votes = ['S', 'L', 'XL']

		// Act
		const average = averageVote('t-shirt', votes)

		// Assert
		expect(average).toBe('L')
	})
})
