import { describe, expect, it } from 'vitest'

import { inRows } from '../src/bot/cards/button-rows.mts'

describe('inRows', () => {
	it.each([
		// buttons, max per row, expected row lengths
		[12, 20, [12]],
		[12, 6, [6, 6]],
		[12, 5, [4, 4, 4]],
		[11, 5, [4, 4, 3]],
		[6, 4, [3, 3]],
		[3, 1, [1, 1, 1]],
	])('puts %i buttons with room for %i in rows of %j', (count, maxPerRow, expected) => {
		// Arrange
		const buttons = Array.from({ length: count }, (_, index) => index)

		// Act
		const rows = inRows(buttons, maxPerRow)

		// Assert
		expect(rows.map(row => row.length)).toEqual(expected)
	})

	it('keeps the buttons in order', () => {
		// Act
		const rows = inRows(['a', 'b', 'c', 'd', 'e'], 3)

		// Assert
		expect(rows.flat()).toEqual(['a', 'b', 'c', 'd', 'e'])
	})

	it('has nothing to lay out without buttons', () => {
		// Act
		const rows = inRows([], 5)

		// Assert
		expect(rows).toEqual([])
	})
})
