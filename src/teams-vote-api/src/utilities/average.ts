import { Deck, decks, Submission } from "@teams-vote/data"

function calculateAverageShirt(submissions: Submission<'t-shirt'>[]) {

    const validScores: number[] = [];

    for (const submission of submissions) {
        const { score } = submission;

        if (score === '?' || score === 'skip') continue;

        const num = decks.tShirtSizes[score];
        if (num === undefined) continue;

        validScores.push(num);
    }

    if (validScores.length === 0) return undefined;

    const average = validScores.reduce((sum, x) => sum + x, 0) / validScores.length;
    const nearestCard = roundToNearestCard(average, decks.tShirtDeck);

    return decks.tShirtLabels[nearestCard]
}

function calculateAverageFibonacci(
    submissions: Submission<'fibonacci'>[],
    deck: number[]
) {

    const validScores: number[] = [];

    for (const submission of submissions) {
        const { score } = submission;

        if (score === '?' || score === 'skip') continue;
        if (isNaN(score)) continue;

        if (!deck.includes(score)) continue; // only allow values in the deck
        validScores.push(score);
    }

    if (validScores.length === 0) return undefined;

    const average = validScores.reduce((sum, number) => sum + number, 0) / validScores.length;
    return roundToNearestCard(average, deck);
}

function roundToNearestCard(average: number, deck: number[]) {
    if (deck.length === 0) return average;

    let nearest = deck[0];
    let minDiff = Math.abs(average - nearest);

    for (const card of deck) {
        const diff = Math.abs(average - card);
        if (diff < minDiff) {
            minDiff = diff;
            nearest = card;
        }
    }

    return nearest;
}

export function calculateAverage(selectedDeck: Deck, submissions: Submission<Deck>[]) {
    if (submissions.length === 0) return undefined

    if (selectedDeck === 'fibonacci') return calculateAverageFibonacci(submissions as Submission<'fibonacci'>[], decks.baseFibonacci);
    if (selectedDeck === 'modified-fibonacci') return calculateAverageFibonacci(submissions as Submission<'fibonacci'>[], decks.modifiedFibonacci);
    if (selectedDeck === 't-shirt') return calculateAverageShirt(submissions as Submission<'t-shirt'>[]);

    throw new Error('Unsupported deck')
}

export function validateScore(selectedDeck: Deck, score: string | number) {
    if (score === '?' || score === 'skip') return true;
    const cardsInDeck = getDeck(selectedDeck);
    if (!cardsInDeck.some(card => card === score)) return false;
    return true;
}

function getDeck(selectedDeck: Deck) {
    if (selectedDeck === 'fibonacci') return decks.baseFibonacci
    if (selectedDeck === 'modified-fibonacci') return decks.modifiedFibonacci
    if (selectedDeck === 't-shirt') return decks.tShirtKeys

    throw new Error('Unsupported deck')
}