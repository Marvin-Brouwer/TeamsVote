import { useParams } from "@solidjs/router";
import { type Accessor, children, createContext, createMemo, createSignal, onCleanup, onMount, type ParentComponent, Setter, Show, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { postCard, useTeams } from "./teams-context";

const apiUrl = import.meta.env.VITE_API_URL as string;

export type SessionContext = {
    admin: boolean,
    ended: boolean,
    roundKey: string,
    meetingId: string,
    user: {
        id: string,
        name: string
    },
    users: {
        id: string,
        name: string
    }[],
    token: string,
    submissions: {user: { id: string, name: string}, score: number | string}[]
}
export type UseSessionContext = {
    session: SessionContext,
    setShowScores: Setter<boolean>
    showScores: Accessor<boolean>
    setAggregate: Setter<number | string | undefined>
    aggregate: Accessor<number | string | undefined>
}

const sessionContext = createContext<UseSessionContext>({
    session: {
        admin: false,
        ended: false,
        roundKey: '',
        user: {
            id: '',
            name: '',
        },
        meetingId: '',
        token: '',
        users: [],
        submissions: []
    },
    setShowScores: () => false,
    showScores: () => false,
    setAggregate: () => undefined,
    aggregate: () => undefined,
})
export const SessionProvider: ParentComponent = (props) => {

    const [activeSession, setSession] = createStore<SessionContext>(sessionContext.defaultValue.session)
    const session = () => activeSession ?? sessionContext.defaultValue.session
    const [showScores, setShowScores] = createSignal(false);
    const [aggregate, setAggregate] = createSignal<string | number>();

    const abortController = new AbortController();
    onCleanup(() => abortController.abort('onCleanup'))

    const { teamsContext, getAuthToken } = useTeams()!;
    const teamsChannelId = teamsContext().channel?.id
    const user = !teamsContext().user ? undefined : {
        id: teamsContext().user!.id,
        name: teamsContext().user!.displayName!
    }

    const { roundKey, token } = useParams() as { roundKey: string, token: string }
    let interval: number | undefined;
    onMount(() => {
        interval = setInterval(async () => {
            try{
            const status = await postStatus(teamsChannelId!, roundKey, token, user!, abortController.signal)
            const newValue = { ...status.result, meetingId: teamsChannelId, user, token }
            setSession(s => {
                if (JSON.stringify(newValue) === JSON.stringify(s)) return s;
                return newValue;
            })
        } catch  {
            setSession(s => ({ ...s, ended: true }))
            clearInterval(interval);
            const summaryCard = createSummaryCard(session().roundKey, aggregate());
            const authToken = await getAuthToken()
            if (import.meta.env.PROD) {
                await postCard(teamsContext()!.chat!.id, authToken, summaryCard)
            }
            else {
                alert(JSON.stringify(summaryCard, null, 2))
            }
            // TODO see if this works in teams
            window.close();
        }
        }, 200);
    })
    onCleanup(() => clearInterval(interval))
    
    return <sessionContext.Provider value={{...sessionContext.defaultValue, session: session(),showScores, setShowScores, aggregate, setAggregate }}>
        <Show when={!!activeSession}>
            {children(() => props.children)()}
        </Show>
    </sessionContext.Provider>
}

export function useSession() { return useContext(sessionContext); };


async function postStatus(meetingId: string, roundKey: string, token: string, user: { id: string, name: string }, signal: AbortSignal) {
    const response = await fetch(`${apiUrl}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId, roundKey, token, user }),
        signal
    }).then(async httpResponse => {
        if (!httpResponse.ok) throw await httpResponse.text();
        return httpResponse.json();
    });

    return response;
}


function createSummaryCard(roundKey: string, score: string | number | undefined) {

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
                        score ? 
                        {
                            type: "TextBlock",
                            text: `Result: ${score}`,
                        } : {
                            text: `No result`,
                        }
                    ],
                    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
                    version: "1.4",
                },
            },
        ],
    };

    return card;
}
