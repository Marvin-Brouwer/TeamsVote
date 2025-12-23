
export type Deck = 'fibonacci' | 'modified-fibonacci' | 't-shirt'
export const defaultDeck: Deck = 'modified-fibonacci' as const

const baseFibonacci = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
const modifiedFibonacci = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];
const tShirtSizes: Record<string, number> = { XS: 1, S: 2, M: 3, L: 4, XL: 5 };
const tShirtDeck = Object.values(tShirtSizes);
const tShirtKeys = Array.from(tShirtDeck.keys());
const tShirtLabels = Object.entries(tShirtSizes).reduce<Record<number, string>>((acc, [label, num]) => {
    acc[num] = label;
    return acc;
}, {});


export const decks = {
    baseFibonacci,
    modifiedFibonacci,
    tShirtSizes,
    tShirtDeck,
    tShirtKeys,
    tShirtLabels
}