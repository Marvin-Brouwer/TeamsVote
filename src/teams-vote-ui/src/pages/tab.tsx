import { createResource, createSignal, JSX, onCleanup, Show, type Component } from "solid-js";
import { postCard, useTeams, type TeamsContext } from "../contexts/teams-context";
import { Button, ButtonAppearance, TextFieldAppearance } from "@fluentui/web-components";
import { formatUrl } from "../helpers/url";

import "./tab.css"

const apiUrl = import.meta.env.VITE_API_URL as string;

const [healthCheck] = createResource(() => true, checkHealth);

export const TabView: Component = () => {

    const { teamsContext, getAuthToken } = useTeams()!;
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

        const session = await postStart(teamsChannelId, roundKeyValue, user, abortController.signal);
        const appOrigin = window.location.origin;
        const pageUrl = `${appOrigin}/TeamsVote/teams/vote/${teamsChannelId}/${session.token}`;

        const card = createJoinCard(pageUrl, roundKeyValue, teamsContext()!);
        const authToken = await getAuthToken();

        if (import.meta.env.PROD) {
            await postCard(teamsContext()!.chat!.id, authToken, card)
            // TODO open popup automatically
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
            <fluent-progress-ring />
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
                <div class="menu">
                    <fluent-card class="launcher">
                        <fluent-text-field appearance={"filled" as TextFieldAppearance} placeholder="What are you estimating" onInput={(e) => {
                            setRoundKey(e.currentTarget.value)
                        }} value={roundKey()} /> {" "}
                        <fluent-button ref={startButton} appearance={"accent" as ButtonAppearance} onClick={startEstimate} disabled={!running() || !roundKey()}>Estimate</fluent-button>
                    </fluent-card>
                </div>
            </div>

        </Show>
    </>
}

async function checkHealth() {
    const response = await fetch(`${apiUrl}/health`, {
        method: 'GET'
    }).then(async httpResponse => {
        if (!httpResponse.ok) {
            alert(await httpResponse.text())
        };
        return true;
    });

    return response;
}

async function postStart(meetingId: string, roundKey: string, user: { id: string, name: string }, signal: AbortSignal) {
    const response = await fetch(`${apiUrl}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // TODO dropdown for type
        body: JSON.stringify({ meetingId, roundKey, type: "modified-fibonacci", user }),
        signal
    }).then(async httpResponse => {
        if (!httpResponse.ok) throw await httpResponse.text();
        return httpResponse.json();
    });

    console.log(response)
    return response;
}

function createJoinCard(pageUrl: string, roundKey: string, teamsContext: TeamsContext) {

    const deepLink = `https://teams.microsoft.com/l/task/${teamsContext.app.appId}?url=${encodeURIComponent(pageUrl)}&height=large&width=medium&title=Vote`;

    const card = {
        "type": "AdaptiveCard",
        "$schema": "https://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.5",
        "body": [
            {
                "type": "TextBlock",
                "text": "Teams Vote",
                "wrap": true,
                "style": "heading",
                "size": "Large"
            },
            {
                "type": "TextBlock",
                "text": `Vote on ${formatUrl(roundKey)}`,
                "wrap": true,
                "separator": true
            },
            {
                "type": "ActionSet",
                "actions": [
                    {
                        "type": "Action.OpenUrl",
                        "title": "Vote",
                        "iconUrl": "icon:Vote",
                        "url": deepLink,
                        "style": "positive"
                    }
                ]
            }
        ]
    }

    return card;
}
