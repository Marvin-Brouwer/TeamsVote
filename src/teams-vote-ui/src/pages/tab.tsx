import { createResource, createSignal, onCleanup, Show, type Component } from "solid-js";
import { useTeams } from "../contexts/teams-context";
import { Button, ButtonAppearance, TextFieldAppearance } from '@fluentui/web-components';
import { Deck, defaultDeck, StartRequest } from "@teams-vote/data";
import { api } from "../helpers/api";
import { cardBuilder } from '../../../teams-vote-client-util/src/teams/card-builder';
import { DeckSelector } from "../components/deck-selector";

import "./tab.css"

const [healthCheck] = createResource(() => true, api.checkHealth);

export const TabView: Component = () => {

    const { teamsContext, getAuthToken, messages } = useTeams()!;
    const [deck, changeDeck] = createSignal<Deck>(defaultDeck);
    const [roundKey, setRoundKey] = createSignal<string>()
    let startButton!: Button & HTMLButtonElement;

    const abortController = new AbortController();
    onCleanup(() => abortController.abort('onCleanup'))
    const running = () => healthCheck() === true;

    const teamsChannelId = teamsContext().channel?.id;
    const user = !teamsContext().user ? undefined : {
        id: teamsContext().user!.id,
        name: teamsContext().user!.displayName!
    }

    async function startEstimate() {
        if (!teamsChannelId) return;
        if (!user) return;
        const roundKeyValue = roundKey();
        if (!roundKeyValue) return;

        startButton.disabled = true;
        const startRequest: StartRequest = {
            meetingId: teamsChannelId,
            roundKey: roundKeyValue,
            selectedDeck: deck(),
            user
        }

        const session = await api.requestSessionStart(startRequest, abortController.signal);
        const appOrigin = window.location.origin;
        const pageUrl = `${appOrigin}/TeamsVote/teams/vote/${teamsChannelId}/${session.token}`;

        const card = cardBuilder.createJoinCard(pageUrl, roundKeyValue, teamsContext()!.app.appId!.toString());
        const authToken = await getAuthToken();

        if (import.meta.env.PROD) {
            await messages.postCard(teamsContext()!.chat!.id, authToken, card)
        }
        else {
            navigator.clipboard.writeText(JSON.stringify(card, null, 2))
                .then(() => {
                    alert(JSON.stringify(card, null, 2))
                    window.open(pageUrl, '_blank')
                })
                .catch(err => console.error("Failed to copy:", err));
        }

        startButton.disabled = false;
        setRoundKey('')
    }

    return <>
        <Show when={!running()}>
            <div class="view tab-spinner" style={import.meta.env.DEV && teamsChannelId === 'test-channel' ? '--vote-height: calc(100% - 70px);' : undefined}>
                <fluent-progress-ring />
            </div>
        </Show>
        <Show when={running()}>
            <div class="view" style={import.meta.env.DEV && teamsChannelId === 'test-channel' ? '--vote-height: calc(100% - 70px);' : undefined}>
                <div class="content">
                    <p>TODO: Maybe history will be shown here</p>
                    <p>If that's not possible, we'll add a basic readme</p>
                    <p>&nbsp;</p>
                    <pre style="display: inline-block; text-align: left; width: 100%;">
                        {JSON.stringify(teamsContext(), null, 2)}
                    </pre>
                    <p>&nbsp;</p>
                </div>
                <div class="menu overflow">
                    <fluent-card class="launcher-fake" />
                    <div class="launcher">
                        <div>
                            <fluent-text-field
                                id="round-input"
                                appearance={"filled" as TextFieldAppearance}
                                placeholder="What are you estimating"
                                onInput={(e) => {
                                    setRoundKey(e.currentTarget.value)
                                }} value={roundKey()}
                            />
                        </div>
                        <div>
                            <DeckSelector deck={deck} changeDeck={changeDeck} />
                            <fluent-button
                                ref={startButton}
                                appearance={"accent" as ButtonAppearance}
                                onClick={startEstimate}
                                disabled={!running() || !roundKey()}
                                id="estimate-button"
                            >
                                Estimate
                            </fluent-button>
                        </div>
                    </div>
                </div>
            </div>
        </Show>
    </>
}