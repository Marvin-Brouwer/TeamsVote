import { createResource, createSignal, JSX, onCleanup, Show, type Component } from "solid-js";
import { postCard, useTeams, type TeamsContext } from "../contexts/teams-context";
import { ButtonAppearance, TextFieldAppearance } from "@fluentui/web-components";

import "./tab.css"

const apiUrl = import.meta.env.VITE_API_URL as string;

const [healthCheck] = createResource(() => true, checkHealth);

export const TabView: Component = () => {

    const { teamsContext, getAuthToken } = useTeams()!;
    const [roundKey, setRoundKey] = createSignal<string>()

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
            alert(JSON.stringify(card, null, 2))
            window.open(pageUrl, '_blank')
        }
    }

    return <>
        <Show when={!running()}>
            <fluent-progress-ring />
        </Show>
        <Show when={running()}>
            <p>TODO: Maybe history will be shown here</p>
            <p>If that's not possible, we'll add a basic readme</p>
            <p>&nbsp;</p>
            <pre style="display: inline-block; text-align: left; overflow-x: scroll; height: 200px; width: 100%;">
                {JSON.stringify(teamsContext(), null, 2)}
            </pre>
            <p>&nbsp;</p>
            <fluent-card class="launcher">
                <fluent-text-field appearance={"filled" as TextFieldAppearance}placeholder="What are you estimating" onInput={(e) => {
                    setRoundKey(e.currentTarget.value)
                }} /> {" "}
                <fluent-button appearance={"accent"  as ButtonAppearance} onClick={startEstimate} disabled={!running() || !roundKey()}>Estimate</fluent-button>
            </fluent-card>
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

async function postStart(meetingId: string, roundKey: string, user: { id: string, name: string}, signal: AbortSignal) {
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
        type: "message",
        attachments: [
            {
                contentType: "application/vnd.microsoft.card.adaptive",
                content: {
                    type: "AdaptiveCard",
                    body: [
                        {
                            type: "TextBlock",
                            text: `Vote on ${roundKey}`,
                        },
                    ],
                    actions: [
                        {
                            type: "Action.OpenUrl",
                            title: "Vote",
                            url: deepLink,
                        },
                    ],
                    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
                    version: "1.4",
                },
            },
        ],
    };

    return card;
}

