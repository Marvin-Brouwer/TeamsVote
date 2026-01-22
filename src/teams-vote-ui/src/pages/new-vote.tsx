import { onCleanup, onMount, type Component } from "solid-js";
import { useTeams } from "../contexts/teams-context";
import { Deck, defaultDeck, StartRequest, tryParseDeck } from "@teams-vote/data";
import { useNavigate, useParams, useSearchParams } from "@solidjs/router";
import { api } from "../helpers/api";

import "./new-vote.css"
import { cardBuilder } from '../../../teams-vote-client-util/src/teams/card-builder';

export const NewVoteView: Component = () => {

    const { teamsContext, messages } = useTeams()!;
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

        const session = await api.requestSessionStart(startRequest, abortController.signal);
        const appOrigin = window.location.origin;
        const pageUrl = `${appOrigin}/TeamsVote/teams/vote/${teamsChannelId}/${session.token}`;

        const card = cardBuilder.createJoinCard(pageUrl, roundKeyValue, teamsContext()!.app.appId!.toString());
        // await messages.postCard(teamsContext()!.chat!.id, authToken, card)
        console.log('Here used to be a postCard', card)

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

