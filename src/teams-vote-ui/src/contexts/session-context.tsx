import { useParams } from "@solidjs/router";
import { type Accessor, children, createContext, createMemo, createSignal, onCleanup, onMount, type ParentComponent, Show, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { useTeams } from "./teams-context";

const apiUrl = import.meta.env.VITE_API_URL as string;

export type SessionContext = {
    admin: boolean,
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
    session: SessionContext
}

const sessionContext = createContext<UseSessionContext>({
    session: {
        admin: false,
        roundKey: '',
        user: {
            id: '',
            name: '',
        },
        meetingId: '',
        token: '',
        users: [],
        submissions: []
    }
})
export const SessionProvider: ParentComponent = (props) => {

    const [activeSession, setSession] = createStore<SessionContext>(sessionContext.defaultValue.session)
    const session = () => activeSession ?? sessionContext.defaultValue.session

    const abortController = new AbortController();
    onCleanup(() => abortController.abort('onCleanup'))

    const { teamsContext } = useTeams()!;
    const teamsChannelId = teamsContext().channel?.id
    const user = !teamsContext().user ? undefined : {
        id: teamsContext().user!.id,
        name: teamsContext().user!.displayName!
    }

    const { roundKey, token } = useParams() as { roundKey: string, token: string }
    let interval: number | undefined;
    onMount(() => {
        interval = setInterval(async () => {
            const status = await postStatus(teamsChannelId!, roundKey, token, user!, abortController.signal)
            const newValue = { ...status.result, meetingId: teamsChannelId, user, token }
            setSession(s => {
                if (JSON.stringify(newValue) === JSON.stringify(s)) return s;
                return newValue;
            })
        }, 200);
    })
    onCleanup(() => clearInterval(interval))
    
    return <sessionContext.Provider value={{...sessionContext.defaultValue, session: session() }}>
        <Show when={!!activeSession}>
            <pre style="text-align: left;">
                {JSON.stringify(activeSession!, null, 2)}
            </pre>
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
