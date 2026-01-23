import { useParams } from "@solidjs/router";
import { type Accessor, children, createContext, createSignal, onCleanup, onMount, type ParentComponent, Setter, Show, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { useTeams } from "./teams-context";
import { ClientSession, User, StatusRequest } from '@teams-vote/data';
import { api } from "../helpers/api";
import { cardBuilder } from "@teams-vote/client-util";

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
    selectedDeck: 'modified-fibonacci'
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

    const { getMeetingId, getUser, teamsDialog } = useTeams()!;
    const meetingId = getMeetingId()
    const user = getUser()

    const { token } = useParams() as { token: string }
    let interval: number | undefined;
    onMount(() => {
        interval = setInterval(async () => {
            try {
                if (!meetingId) throw new Error('No meetingId')
                if (!user) throw new Error('No user')
                const statusRequest: StatusRequest = {
                    meetingId,
                    user,
                    token
                }
                const status = await api.requestStatus(statusRequest, abortController.signal)
                setSession(s => {
                    const newValue = { ...s, ...statusRequest, ...status };
                    if (JSON.stringify(newValue) === JSON.stringify(s)) return s;
                    console.log(newValue)
                    return newValue;
                })
            } catch {
                setSession(s => ({ ...s, ended: true }))
                clearInterval(interval);
                const summaryCard = cardBuilder.createSummaryCard(session().roundKey, aggregate());
                // await messages.postCard(teamsContext()!.chat!.id, authToken, summaryCard)
                console.log('Here used to be a postCard', summaryCard)

                if (import.meta.env.DEV) debugger;
                teamsDialog.url.submit();
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

// TODO make the copy work:
// adaptiveCard.onExecuteAction = (action) => {
//   const data = (action as any).data;
//   if (data?.copyValue) {
//     navigator.clipboard.writeText(data.copyValue)
//       .then(() => console.log("Copied:", data.copyValue))
//       .catch(console.error);
//   }
// };
