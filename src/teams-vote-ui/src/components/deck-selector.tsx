import { ListboxOption } from '@microsoft/fast-foundation';
import { Deck } from '@teams-vote/data';
import { Accessor, Component, Setter } from 'solid-js';

import "./deck-selector.css"

export type DeckSelectorProps = {
    deck: Accessor<Deck>
    changeDeck: Setter<Deck>
}

// TODO remember selection in cookies or other local storage (perhaps graph data on user?)
export const DeckSelector: Component<DeckSelectorProps> = ({ deck, changeDeck }) => <fluent-select
    id="deck-select"
    ref={(el) => {
        // Fix the fluent-select not working
        if (!el) return;
        el.value = deck();
        const option = el.querySelector<ListboxOption>(`[value="${deck()}"]`);
        if (option) el.selectedOptions = [option]
    }}
    onChange={e => changeDeck(e.currentTarget.value as Deck)}
>
    <fluent-option value="modified-fibonacci">Modified fibonacci</fluent-option>
    <fluent-option value="fibonacci">Fibonacci</fluent-option>
    <fluent-option value="t-shirt">T-Shirt sizes</fluent-option>
</fluent-select>