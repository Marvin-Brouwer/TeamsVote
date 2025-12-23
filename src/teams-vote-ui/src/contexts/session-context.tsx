import { useParams } from "@solidjs/router";
import { type Accessor, children, createContext, createMemo, createSignal, onCleanup, onMount, type ParentComponent, Setter, Show, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { postCard, useTeams } from "./teams-context";
import { ClientSession, Deck, User, StatusRequest, StatusResponse } from '@teams-vote/data';

const apiUrl = import.meta.env.VITE_API_URL as string;

export type SessionContext = ClientSession & {
    admin: boolean,
    ended: boolean,

    user: User
}
export type UseSessionContext = {
    session: SessionContext,
    setShowScores: Setter<boolean>
    showScores: Accessor<boolean>
    setAggregate: Setter<number | string | undefined>
    aggregate: Accessor<number | string | undefined>
}

const defaultSession: SessionContext = {
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
    submissions: [],
    type: 'modified-fibonacci'
}
const sessionContext = createContext<UseSessionContext>({
    session: defaultSession,
    setShowScores: () => false,
    showScores: () => false,
    setAggregate: () => undefined,
    aggregate: () => undefined
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
            try {
                const statusRequest: StatusRequest = {
                    roundKey,
                    meetingId: teamsChannelId!,
                    user: user!,
                    token
                }
                const status = await postStatus(statusRequest, abortController.signal)
                setSession(s => {
                    const newValue = { ...s, ...statusRequest, ...status };
                    if (JSON.stringify(newValue) === JSON.stringify(s)) return s;
                    console.log(newValue)
                    return newValue;
                })
            } catch {
                setSession(s => ({ ...s, ended: true }))
                clearInterval(interval);
                const summaryCard = createSummaryCard(session().roundKey, aggregate());
                const authToken = await getAuthToken()
                if (import.meta.env.PROD) {
                    await postCard(teamsContext()!.chat!.id, authToken, summaryCard)
                }
                else {
                    await navigator.clipboard.writeText(JSON.stringify(summaryCard, null, 2))
                        .then(() => {
                            alert(JSON.stringify(summaryCard, null, 2))
                        })
                        .catch(err => console.error("Failed to copy:", err));
                }
                // TODO see if this works in teams
                window.close();
            }
        }, 200);
    })
    onCleanup(() => clearInterval(interval))

    return <sessionContext.Provider value={{ 
        ...sessionContext.defaultValue, 
        session: session(), 
        showScores, setShowScores, 
        aggregate, setAggregate
    }}>
        <Show when={!!activeSession}>
            {children(() => props.children)()}
        </Show>
    </sessionContext.Provider>
}

export function useSession() { return useContext(sessionContext); };


async function postStatus(statusRequest: StatusRequest, signal: AbortSignal) {
    const response = await fetch(`${apiUrl}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusRequest),
        signal
    }).then(async httpResponse => {
        if (!httpResponse.ok) throw await httpResponse.text();
        return httpResponse.json() as Promise<StatusResponse>;
    });

    return response;
}


// TODO make the copy work:
// adaptiveCard.onExecuteAction = (action) => {
//   const data = (action as any).data;
//   if (data?.copyValue) {
//     navigator.clipboard.writeText(data.copyValue)
//       .then(() => console.log("Copied:", data.copyValue))
//       .catch(console.error);
//   }
// };

//adaptiveCard is your AdaptiveCard instance


function createSummaryCard(roundKey: string, score: string | number | undefined) {

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
                "text": `Vote on [${roundKey}](${roundKey})`,
                "wrap": true,
                "separator": true
            },
            {
                "type": "TextBlock",
                "text": `Average score: **${score}**`,
                "wrap": true,
                "spacing": "None"
            },
            {
                "type": "ActionSet",
                "actions": [
                    {
                        "type": "Action.Submit",
                        "title": "Copy",
                        "data": {
                            "copyValue": score
                        },
                        "iconUrl": "icon:Copy"
                    }
                ]
            }
        ]
    }

    return card;
}
