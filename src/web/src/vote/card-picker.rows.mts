/**
 * How many cards to put on a row, so they spread over as few rows as fit, as evenly as possible.
 * 12 cards with room for 9 become two rows of 6, with room for 5 three rows of 4.
 * Only the last row can come up short, and by as little as possible.
 *
 * @example
 * ```ts
 * cardsPerRow(12, 9) // 6
 * cardsPerRow(12, 5) // 4
 * cardsPerRow(11, 5) // 4, so 4 + 4 + 3
 * ```
 */
export function cardsPerRow(cardCount: number, fitPerRow: number): number {
	if (cardCount <= 0) return 0
	const fit = Math.max(1, Math.floor(fitPerRow))
	const rows = Math.ceil(cardCount / fit)
	return Math.ceil(cardCount / rows)
}

/** How many cards of `cardWidth` fit next to each other in `availableWidth`, with `gap` between them. */
export function cardsThatFit(availableWidth: number, cardWidth: number, gap: number): number {
	if (cardWidth <= 0) return 1
	return Math.max(1, Math.floor((availableWidth + gap) / (cardWidth + gap)))
}
