import { type Accessor, children, createContext, createMemo, createSignal, createUniqueId, onMount, type ParentComponent, Show, useContext } from "solid-js";

import * as microsoftTeams from "@microsoft/teams-js";
import { createStore } from "solid-js/store";
import { teamsMessages } from '../../../teams-vote-client-util/src/teams/messages';
import { User } from "@teams-vote/data";

export type TeamsContext = microsoftTeams.app.Context
export type UseTeamsContext = {
    teamsContext: Accessor<TeamsContext>
    teamsTasks: typeof microsoftTeams.tasks
    getAuthToken(): Promise<string>,
    messages: typeof teamsMessages,
    getUser(): User | undefined
    getMeetingId(): string | undefined
}

const teamsContext = createContext<UseTeamsContext | undefined>(undefined)

export async function getContext() {
    if (window.location === window.parent.location) return undefined;
    try {
        await microsoftTeams.app.initialize();
        return await microsoftTeams.app.getContext();
    } catch (err) {
        if ((err as Error).message === "Initialization Failed. No Parent window found.") return undefined;
        throw err;
    }
}

export const TeamsProvider: ParentComponent = (props) => {

    const [getTeamsContext, setTeamsContext] = createSignal<TeamsContext | undefined>(undefined)
    const [testTeamsContext, setTestTeamsContext] = createStore<TeamsContext>({
        app: {
            appId: new microsoftTeams.AppId('local-test'),
            locale: 'en',
            theme: 'default',
            sessionId: 'fake-session',
            host: {
                name: microsoftTeams.HostName.teamsModern,
                clientType: microsoftTeams.HostClientType.web,
                sessionId: 'fake-session'
            }
        },
        page: {
            id: 'test-page',
            frameContext: microsoftTeams.FrameContexts.content
        },
        meeting: {
            id: 'test-meeting'
        },
        chat: {
            id: 'test-chat'
        },
        channel: {
            id: 'test-channel'
        },
        user: {
            id: new URL(window.location.href).searchParams.get('userId') ?? 'user-1',
            displayName: new URL(window.location.href).searchParams.get('userName') ?? 'User one'
        },
        dialogParameters: {}
    });
    const useTestTeamsContext = import.meta.env.PROD ? undefined : {
        teamsContext: () => testTeamsContext,
        teamsTasks: microsoftTeams.tasks,
        getAuthToken() {
            return Promise.resolve('fake-auth')
        },
        messages: {
            async postCard(_chatId: string, _accessToken: string, cardPayload: any) {
                console.groupCollapsed("TEAMS CARD")
                console.info(JSON.stringify(cardPayload, null, 2));
                console.groupEnd();
            }
        },
        getUser,
        getMeetingId
    }

    onMount(async () => {
        const windowTeamsContext = await getContext();
        setTeamsContext(windowTeamsContext);
    });

    async function getAuthToken() {
        return await microsoftTeams.authentication.getAuthToken({
            resources: ["https://graph.microsoft.com"],
        });
    };

    const activeTeamsContext = createMemo(() => {
        if (!getTeamsContext() && import.meta.env.DEV) {
            return useTestTeamsContext
        }
        return {
            teamsContext: getTeamsContext as Accessor<TeamsContext>,
            teamsTasks: microsoftTeams.tasks,
            getAuthToken,
            messages: teamsMessages,
            getUser,
            getMeetingId
        }
    })

    if (import.meta.env.DEV) {
        (window as any).updateTestUser = (id: string, name: string) => {
            setTestTeamsContext("user", {
                id,
                displayName: name
            })
        }
        (window as any).asNewUser = (id: string, name: string) => {
            const url = new URL(window.location.href);
            url.searchParams.set('userName', name);
            url.searchParams.set('userId', id);
            window.open(url, '_blank');
        }
    }

    function getUser(): User | undefined {
        const user = activeTeamsContext()?.teamsContext()?.user;
        if (!user) return undefined

        if(user.displayName) return {
            id: user.id,
            name: user.displayName
        }

        if (user.userPrincipalName) return {
            id: user.id,
            name: user.userPrincipalName.includes('@')
                ? user.userPrincipalName.split('@')[0]
                : user.userPrincipalName
        }

        var uuid = createUniqueId();
        return {
            id: `unknown-${uuid}`,
            name: `Unknown user ${uuid}`
        }
    }

    function getMeetingId(): string | undefined {
        const activeContext = activeTeamsContext()?.teamsContext();
        if (!activeContext) return undefined

        const id = activeContext.meeting?.id ?? activeContext.chat?.id ?? activeContext.channel?.id 
        if (id) return id;
        console.warn('no meeting id available');
        return undefined;
    }

    return <teamsContext.Provider value={activeTeamsContext()}>
        <Show when={import.meta.env.DEV && !getTeamsContext()}>
            <fluent-card style="margin-bottom: 1ex;">
                <p>
                    DEV MODE: Fake session
                    <fluent-badge appearance="neutral">{testTeamsContext.user?.displayName} ({testTeamsContext.user?.id})</fluent-badge>
                </p>
            </fluent-card>
        </Show>
        {/* <Show when={!!getTeamsContext() || import.meta.env.DEV}>
            {children(() => props.children)()}
        </Show> */}
        {children(() => props.children)()}
    </teamsContext.Provider>
}

export function useTeams() { return useContext(teamsContext); };