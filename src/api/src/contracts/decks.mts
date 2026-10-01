export const deckIds = ['modified-fibonacci', 'fibonacci', 't-shirt'] as const
export type DeckId = typeof deckIds[number]

export const defaultDeckId: DeckId = 'modified-fibonacci'

/** A card in a deck. `value` is what people see and vote with, `weight` is what the average is computed from. */
export type DeckCard = {
	readonly value: string
	readonly weight: number
}

export type Deck = {
	readonly id: DeckId
	readonly label: string
	readonly cards: readonly DeckCard[]
}

/** "I don't know". Counts as having voted, but not towards the average. */
export const unsureVote = '?'
/** Sitting this one out. Counts as having voted, but not towards the average. */
export const skipVote = 'skip'

function numericCards(values: number[]): DeckCard[] {
	return values.map(value => ({ value: String(value), weight: value }))
}

export const decks: Readonly<Record<DeckId, Deck>> = {
	'modified-fibonacci': {
		id: 'modified-fibonacci',
		label: 'Modified Fibonacci',
		cards: numericCards([0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100]),
	},
	'fibonacci': {
		id: 'fibonacci',
		label: 'Fibonacci',
		cards: numericCards([0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]),
	},
	't-shirt': {
		id: 't-shirt',
		label: 'T-shirt sizes',
		cards: [
			{ value: 'XS', weight: 1 },
			{ value: 'S', weight: 2 },
			{ value: 'M', weight: 3 },
			{ value: 'L', weight: 4 },
			{ value: 'XL', weight: 5 },
		],
	},
}

export function isDeckId(value: unknown): value is DeckId {
	return typeof value === 'string' && (deckIds as readonly string[]).includes(value)
}

/** Looks a deck up by id, for input that came from a person or a request. */
export function parseDeckId(value: string | undefined): DeckId | undefined {
	if (value === undefined || value === '') return defaultDeckId
	const normalized = value.trim().toLowerCase()
	return isDeckId(normalized) ? normalized : undefined
}

export function isValidVote(deckId: DeckId, vote: string): boolean {
	if (vote === unsureVote || vote === skipVote) return true
	return decks[deckId].cards.some(card => card.value === vote)
}
