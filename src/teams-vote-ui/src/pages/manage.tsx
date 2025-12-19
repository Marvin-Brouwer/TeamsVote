import { createEffect, createMemo, createResource, createSignal, onCleanup, onMount, Show, type Component } from "solid-js";
import { useParams } from "@solidjs/router";
import { useTeams, type TeamsContext } from "../contexts/teams-context";

const apiUrl = import.meta.env.VITE_API_URL as string;

const [healthCheck] = createResource(() => true, checkHealth);

export const ManagementView: Component = () => {

    const { teamsContext, getAuthToken } = useTeams()!;

    const abortController = new AbortController();
    onCleanup(() => abortController.abort('onCleanup'))

    // TODO add spinner
    const running = () => healthCheck() === true;

    // TODO render link if roundKey is url
    const { teamsChannelId, roundKey } = useParams()
    const [voteStarted, setVoteStarted] = createSignal(false)

    async function startEstimate() {
        setVoteStarted(true);
        const session = await postStart(teamsChannelId, roundKey, abortController.signal);
        const card = createJoinCard(teamsChannelId, roundKey, session.token, teamsContext()!);
        const authToken = await getAuthToken();
        if (import.meta.env.PROD) await postCard(teamsContext()!.chat!.id, authToken, card)
        else alert(JSON.stringify(card, null, 2))
    }

    return <>
        <h1>Estimate</h1>
        <h2>{roundKey.toString()}</h2>
        <Show when={!running()}>
            <p>Loading API service...</p>
        </Show>
        <button onClick={startEstimate} disabled={!running() || voteStarted()}>Start</button>
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

async function postStart(meetingId: string, roundKey: string, signal: AbortSignal) {
    const response = await fetch(`${apiUrl}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId, roundKey, type: "modified-fibonacci" }),
        signal
    }).then(async httpResponse => {
        if (!httpResponse.ok) throw await httpResponse.text();
        return httpResponse.json();
    });

    console.log(response)
    return response;
}

function createJoinCard(teamsChannelId: string, roundKey: string, token: string, teamsContext: TeamsContext) {

    const appOrigin = window.location.origin;
    const pageUrl = encodeURIComponent(`${appOrigin}/teamsvote/${teamsChannelId}/${roundKey}/${token}`);

    const deepLink = `https://teams.microsoft.com/l/task/${teamsContext.app.appId}?url=${pageUrl}&height=large&width=medium&title=Vote`;

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


async function postCard(chatId: string, accessToken: string, cardPayload: any) {
  const response = await fetch(`https://graph.microsoft.com/v1.0/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cardPayload),
  });

  if (!response.ok) {
    throw new Error(`Failed to post card: ${await response.text()}`);
  }

  console.log("Card posted successfully!");
}
