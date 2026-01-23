import { type Accessor, createContext, createMemo, createSignal, createUniqueId, onMount, type ParentComponent, Show, useContext } from "solid-js";

import * as microsoftTeams from "@microsoft/teams-js";
import { createStore } from "solid-js/store";
import { teamsMessages } from '../../../teams-vote-client-util/src/teams/messages';
import { User } from "@teams-vote/data";
import { useTheme } from "../theme";

export type TeamsContext = microsoftTeams.app.Context
export type UseTeamsContext = {
    teamsContext: Accessor<TeamsContext>
    teamsTasks: typeof microsoftTeams.tasks,
    teamsDialog: typeof microsoftTeams.dialog,
    messages: typeof teamsMessages,
    getUser(): User | undefined
    getMeetingId(): string | undefined,
    authentication: typeof microsoftTeams.authentication
}

export async function globalTeamsContext() {
    console.log('TEAMSVOTE', 'globalTeamsContext')
    if (import.meta.env.DEV && location.host.startsWith('localhost')) return undefined;

    try {
        console.log('TEAMSVOTE', 'initializing teamsContext')
        await microsoftTeams.app.initialize();
        return await microsoftTeams.app.getContext();
    } catch (err) {
        if ((err as Error).message === "Initialization Failed. No Parent window found.") return undefined;
        throw err;
    }
}

const teamsContext = createContext<UseTeamsContext | undefined>(undefined)

export const TeamsProvider: ParentComponent = (props) => {

    const { applyTheme } = useTheme();

    const [internalTeamsContext, setTeamsContext] = createSignal<TeamsContext | undefined>(undefined)
    const [testTeamsContext, setTestTeamsContext] = createStore<TeamsContext>({
        app: {
            appId: new microsoftTeams.AppId('local-test'),
            locale: 'en',
            theme: 'light',
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

    onMount(async () => {
        const windowTeamsContext = await globalTeamsContext();
        setTeamsContext(windowTeamsContext);
        if (!windowTeamsContext) return;

        queueMicrotask(() => {
            applyTheme(windowTeamsContext.app.theme ?? 'light');
            if (teamsContext) microsoftTeams.app.registerOnThemeChangeHandler((theme) => {
                applyTheme(theme);
            });
        });

        try {
            console.log('conversation', microsoftTeams.conversations.isSupported());
        } finally { }
        try {
            console.log('meetingRoom', await microsoftTeams.meetingRoom.getPairedMeetingRoomInfo());
        } finally { }
    });

    const activeTeamsContext = createMemo(() => {
        if (import.meta.env.DEV && !internalTeamsContext()) {
            return testTeamsContext;
        }
        return internalTeamsContext();
    });

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
        const user = activeTeamsContext()?.user;
        if (!user) return undefined

        if (user.displayName) return {
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
        const activeContext = activeTeamsContext();
        if (!activeContext) return undefined

        const id = activeContext.meeting?.id ?? activeContext.chat?.id ?? activeContext.channel?.id
        if (id) return id;
        console.warn('no meeting id available');
        return undefined;
    }
    const isVisible = createMemo(() => import.meta.env.DEV || internalTeamsContext())

    return <teamsContext.Provider value={{
        teamsContext: internalTeamsContext as Accessor<TeamsContext>,
        teamsTasks: microsoftTeams.tasks,
        teamsDialog: microsoftTeams.dialog,
        messages: teamsMessages,
        getUser,
        getMeetingId,
        authentication: microsoftTeams.authentication
    }}>
        <Show when={import.meta.env.DEV && !internalTeamsContext()}>
            <fluent-card style="margin-bottom: 1ex;">
                <p>
                    DEV MODE: Fake session
                    <fluent-badge appearance="neutral">{testTeamsContext.user?.displayName} ({testTeamsContext.user?.id})</fluent-badge>
                </p>
            </fluent-card>
        </Show>
        <Show when={isVisible()} fallback={"No teamsContext!"}>
            {props.children}
        </Show>
    </teamsContext.Provider>
}

export function useTeams() { return useContext(teamsContext); };