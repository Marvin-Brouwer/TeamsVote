import { describe, expect, it } from 'vitest'

import { cardsPerRow, cardsThatFit } from '../src/vote/card-picker.rows.mts'

describe('cardsPerRow', () => {
	it.each([
		// cards, fit per row, expected per row
		[12, 20, 12],
		[12, 12, 12],
		[12, 11, 6],
		[12, 9, 6],
		[12, 6, 6],
		[12, 5, 4],
		[12, 4, 4],
		[12, 3, 3],
		[11, 5, 4],
		[6, 4, 3],
		[6, 1, 1],
	])('puts %i cards with room for %i at %i per row', (cards, fit, expected) => {
		// Act
		const perRow = cardsPerRow(cards, fit)

		// Assert
		expect(perRow).toBe(expected)
	})

	it('keeps rows within one card of each other', () => {
		for (let cards = 1; cards <= 20; cards++) {
			for (let fit = 1; fit <= 20; fit++) {
				// Act
				const perRow = cardsPerRow(cards, fit)
				const rows = Math.ceil(cards / perRow)
				const lastRow = cards - perRow * (rows - 1)

				// Assert
				expect(perRow).toBeLessThanOrEqual(fit)
				expect(rows).toBe(Math.ceil(cards / fit))
				expect(perRow - lastRow).toBeLessThan(rows)
			}
		}
	})

	it('has nothing to lay out without cards', () => {
		// Act
		const perRow = cardsPerRow(0, 5)

		// Assert
		expect(perRow).toBe(0)
	})
})

describe('cardsThatFit', () => {
	it('counts the gaps between cards, not after the last one', () => {
		// Act
		const fit = cardsThatFit(56 * 5 + 8 * 4, 56, 8)

		// Assert
		expect(fit).toBe(5)
	})

	it('always fits at least one card', () => {
		// Act
		const fit = cardsThatFit(10, 56, 8)

		// Assert
		expect(fit).toBe(1)
	})
})
