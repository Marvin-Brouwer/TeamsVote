import { createResource, createSignal, onCleanup, Show, type Component } from "solid-js";
import { useTeams } from "../contexts/teams-context";
import { Button, ButtonAppearance, TextField, TextFieldAppearance } from '@fluentui/web-components';
import { Deck, defaultDeck, StartRequest } from "@teams-vote/data";
import { api } from "../helpers/api";
import { cardBuilder } from '../../../teams-vote-client-util/src/teams/card-builder';
import { DeckSelector } from "../components/deck-selector";
import { formatUrlForTitle } from "@teams-vote/client-util";

import "./tab.css"
import { DialogDimension } from "@microsoft/teams-js";
import * as microsoftTeams from '@microsoft/teams-js';

const [healthCheck] = createResource(() => true, api.checkHealth);

export const TabView: Component = () => {

    const { teamsContext, getUser, getMeetingId, teamsDialog, authentication } = useTeams()!;
    const [running, setRunningState] = createSignal(false)
    const [deck, changeDeck] = createSignal<Deck>(defaultDeck);
    const [roundKey, setRoundKey] = createSignal<string>()
    let startButton!: Button;
    let keyField!: TextField;

    const abortController = new AbortController();
    onCleanup(() => abortController.abort('onCleanup'))

    // Don't use interval, because the first check may take a while when the server falls asleep
    let timer = checkHealth();
    function checkHealth() {
        return setTimeout(() => {
            setRunningState(healthCheck() ?? false)
            timer = checkHealth();
        }, 2000)
    }
    abortController.signal.addEventListener('abort', () => clearTimeout(timer))

    async function startEstimate() {
        const teamsMeetingId = getMeetingId()
        if (!teamsMeetingId) return console.warn('no-teamsChannelId');
        const user = getUser();
        if (!user) return console.warn('no-user');

        const roundKeyValue = roundKey();
        if (!roundKeyValue) return console.warn('no-roundKey');

        keyField.disabled = true;
        startButton.disabled = true;
        const startRequest: StartRequest = {
            meetingId: teamsMeetingId,
            roundKey: roundKeyValue,
            selectedDeck: deck(),
            user
        }

        const session = await api.requestSessionStart(startRequest, abortController.signal);
        const appOrigin = window.location.origin;
        const pageUrl = `${appOrigin}/TeamsVote/teams/vote/${session.token}`;

        const card = cardBuilder.createJoinCard(pageUrl, roundKeyValue, teamsContext()!.app.appId!.toString());

        try {
            console.log('Here used to be a postCard', card)

            try{
                microsoftTeams.tasks.submitTask({
                    command: 'test1'
                }, import.meta.env.VITE_BOT_ID)
            }catch(e){
                console.error('submittask', e)
            }

            // teamsDialog.url.bot.open({
            //     url: `${appOrigin}/TeamsVote/teams/spinner/`, // your UI
            //     title: formatUrlForTitle(roundKeyValue),
            //     completionBotId: import.meta.env.VITE_BOT_ID,
            //     size: {
            //         height: DialogDimension.Large,
            //         width: DialogDimension.Large
            //     }
            // },(r) => console.log('r',r), pm => console.log('pm', pm));

            microsoftTeams.pages.getConfig()

            // teamsDialog.url.submit({
            //     command: "startVote"
            // });
            // teamsTasks.

            // console.log('a')
            console.log('getAuthToken', window.location.href, window.location.origin)
            const authToken = await authentication.getAuthToken({
                silent: false,
                tenantId: import.meta.env.VITE_TENANT
                // resources: ["https://graph.microsoft.com"] // request Graph token
            });
            // console.log('b')
            // await messages.postCard(teamsMeetingId, authToken, card)

            // // immediately open the task module for initiator
            // teamsDialog.url.open({
            //     title: formatUrlForTitle(roundKeyValue),
            //     url: pageUrl,
            //     size: {
            //         height: DialogDimension.Large,
            //         width: DialogDimension.Medium
            //     }
            // });
        } finally {
            keyField.disabled = false;
            startButton.disabled = false;
            setRoundKey('')
        }
    }

    return <>
        <Show when={!running()}>
            <div class="view tab-spinner" style={import.meta.env.DEV && getMeetingId() === 'test-meeting' ? '--vote-height: calc(100% - 70px);' : undefined}>
                <fluent-progress-ring />
            </div>
        </Show>
        <Show when={running()}>
            <div class="view">
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
                                ref={keyField}
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
                                disabled={!running() || !roundKey() || !getMeetingId() || !getUser()}
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