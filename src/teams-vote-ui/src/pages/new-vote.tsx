import { onCleanup, onMount, type Component } from "solid-js";
import { postCard, useTeams, type TeamsContext } from "../contexts/teams-context";
import { Deck, defaultDeck, SessionResponse, StartRequest, formatUrl, tryParseDeck } from "@teams-vote/data";
import { useNavigate, useParams, useSearchParams } from "@solidjs/router";

import "./new-vote.css"

const apiUrl = import.meta.env.VITE_API_URL as string;

export const NewVoteView: Component = () => {

    const { teamsContext, getAuthToken } = useTeams()!;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const params = useParams();

    const abortController = new AbortController();
    onCleanup(() => abortController.abort('onCleanup'))

    const teamsChannelId = teamsContext().channel?.id;
    const user = !teamsContext().user ? undefined : {
        id: teamsContext().user!.id,
        name: teamsContext().user!.displayName!
    }

    async function startEstimate(roundKeyValue: string, selectedDeck: Deck) {
        if (!teamsChannelId) return;
        if (!user) return;

        const startRequest: StartRequest = {
            meetingId: teamsChannelId,
            roundKey: roundKeyValue,
            selectedDeck,
            user
        }

        const session = await postStart(startRequest, abortController.signal);
        const appOrigin = window.location.origin;
        const pageUrl = `${appOrigin}/TeamsVote/teams/vote/${teamsChannelId}/${session.token}`;

        const card = createJoinCard(pageUrl, roundKeyValue, teamsContext()!);
        const authToken = await getAuthToken();

        if (import.meta.env.PROD) {
            await postCard(teamsContext()!.chat!.id, authToken, card)
        }
        else {
            console.log(JSON.stringify(card, null, 2))
            navigator.clipboard.writeText(JSON.stringify(card, null, 2))
                .catch(err => console.error("Failed to copy:", err));
        }

        return pageUrl
    }

    onMount(async () => {
        let deck = defaultDeck;
        if (searchParams.selectedDeck) {
            const selectedDeck = tryParseDeck(searchParams.selectedDeck as Deck)
            if (selectedDeck instanceof Error) return navigate("/error?reason=invalid-deck", { replace: true });
            deck = selectedDeck
        }
        if (!params.roundKey) {
            return navigate("/error?reason=no-round-key", { replace: true });
        }

        const estimateUrl = await startEstimate(params.roundKey!, deck);
        if (!estimateUrl) return navigate("/error?reason=unknown", { replace: true });

        navigate(new URL(estimateUrl).pathname.replace(import.meta.env.BASE_URL, '/'), { replace: true });
    });

    return <div class="view progress-wrapper" style={import.meta.env.DEV && teamsChannelId === 'test-channel' ? '--vote-height: calc(100% - 70px);' : undefined}>
        <fluent-progress-ring />
    </div>
}


async function postStart(startRequest: StartRequest, signal: AbortSignal) {
    const response = await fetch(`${apiUrl}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(startRequest),
        signal
    }).then(async httpResponse => {
        if (!httpResponse.ok) throw await httpResponse.text();
        return httpResponse.json() as Promise<SessionResponse>;
    });

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
