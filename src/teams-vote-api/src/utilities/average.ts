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

export function calculateAverage(type: Deck, submissions: Submission<Deck>[]) {
    if (submissions.length === 0) return undefined

    if (type === 'fibonacci') return calculateAverageFibonacci(submissions as Submission<'fibonacci'>[], decks.baseFibonacci);
    if (type === 'modified-fibonacci') return calculateAverageFibonacci(submissions as Submission<'fibonacci'>[], decks.modifiedFibonacci);
    if (type === 't-shirt') return calculateAverageShirt(submissions as Submission<'t-shirt'>[]);

    throw new Error('Unsupported deck')
}

export function validateScore(type: Deck, score: string | number) {
    if (score === '?' || score === 'skip') return true;
    const deck = getDeck(type);
    if (!deck.some(card => card === score)) return false;
    return true;
}

function getDeck(type: Deck) {
    if (type === 'fibonacci') return decks.baseFibonacci
    if (type === 'modified-fibonacci') return decks.modifiedFibonacci
    if (type === 't-shirt') return decks.tShirtKeys

    throw new Error('Unsupported deck')
}