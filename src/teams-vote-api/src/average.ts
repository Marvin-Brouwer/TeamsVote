import { Deck, Submission } from "./state";

const baseFibonacci = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
const modifiedFibonacci = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];
const tShirtSizes: Record<string, number> = { XS: 1, S: 2, M: 3, L: 4, XL: 5 };
const tShirtDeck = Object.values(tShirtSizes);
const tShirtKeys = Array.from(tShirtDeck.keys());
const tShirtLabels = Object.entries(tShirtSizes).reduce<Record<number, string>>((acc, [label, num]) => {
    acc[num] = label;
    return acc;
}, {});

function calculateAverageShirt(submissions: Submission<'t-shirt'>[]) {

    const validScores: number[] = [];

    for (const submission of submissions) {
        const { score } = submission;

        if (score === '?' || score === 'skip') continue;

        const num = tShirtSizes[score];
        if (num === undefined) continue;

        validScores.push(num);
    }

    if (validScores.length === 0) return undefined;

    const average = validScores.reduce((sum, x) => sum + x, 0) / validScores.length;
    const nearestCard = roundToNearestCard(average, tShirtDeck);

    return tShirtLabels[nearestCard]
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

    if (type === 'fibonacci') return calculateAverageFibonacci(submissions as Submission<'fibonacci'>[], baseFibonacci);
    if (type === 'modified-fibonacci') return calculateAverageFibonacci(submissions as Submission<'fibonacci'>[], modifiedFibonacci);
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
    if (type === 'fibonacci') return baseFibonacci
    if (type === 'modified-fibonacci') return modifiedFibonacci
    if (type === 't-shirt') return tShirtKeys

    throw new Error('Unsupported deck')
}