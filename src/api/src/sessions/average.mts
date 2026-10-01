import { decks, type DeckCard, type DeckId } from '../contracts/decks.mts'

/**
 * The average of the votes, rounded to the nearest card in the deck.
 * `?`, `skip` and anything that isn't a card are ignored. Gives `undefined` when nothing is left to average.
 * On a tie between two cards the lower one wins, so a split team doesn't round itself up.
 */
export function averageVote(deckId: DeckId, votes: Iterable<string>): string | undefined {
	const cards = decks[deckId].cards
	const weights: number[] = []
	for (const vote of votes) {
		const card = cards.find(candidate => candidate.value === vote)
		if (card) weights.push(card.weight)
	}
	if (weights.length === 0) return undefined

	const mean = weights.reduce((sum, weight) => sum + weight, 0) / weights.length
	return nearestCard(cards, mean).value
}

function nearestCard(cards: readonly DeckCard[], weight: number): DeckCard {
	return cards.reduce((nearest, card) => Math.abs(card.weight - weight) < Math.abs(nearest.weight - weight) ? card : nearest)
}
