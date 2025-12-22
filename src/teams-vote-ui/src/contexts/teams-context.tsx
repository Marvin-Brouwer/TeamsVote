import { type Accessor, children, createContext, createMemo, createSignal, onMount, type ParentComponent, Show, useContext } from "solid-js";

import * as microsoftTeams from "@microsoft/teams-js";
import { useLocation } from '@solidjs/router';
import { createStore } from "solid-js/store";

export type TeamsContext = microsoftTeams.app.Context
export type UseTeamsContext = {
    teamsContext: Accessor<TeamsContext>
    teamsTasks: typeof microsoftTeams.tasks
    getAuthToken(): Promise<string>
}

const teamsContext = createContext<UseTeamsContext | undefined>(undefined)

async function getContext() {
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
        chat: {
            id: 'test-chat'
        },
        user: {
            id: 'user-1',
            displayName: 'User one'
        },
        dialogParameters: {}
    });
    const useTestTeamsContext = import.meta.env.PROD ? undefined : {
        teamsContext: () => testTeamsContext,
        teamsTasks: microsoftTeams.tasks,
        getAuthToken() {
            return Promise.resolve('fake-auth')
        },
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
        return { teamsContext: getTeamsContext as Accessor<TeamsContext>, teamsTasks: microsoftTeams.tasks, getAuthToken }
    })

    if (import.meta.env.DEV) {
        (window as any).updateTestUser = (id: string, name: string) => {
            setTestTeamsContext("user", {
                id,
                displayName: name
            })
        }
    }

    return <teamsContext.Provider value={activeTeamsContext()}>
        <Show when={import.meta.env.DEV && !getTeamsContext()}>
            <fluent-card>
                <p>
                    DEV MODE: Fake session 
                    <fluent-badge appearance="outline" color="red">{testTeamsContext.user?.displayName} ({testTeamsContext.user?.id})</fluent-badge>
                </p>
            </fluent-card>
        </Show>
        <Show when={!!getTeamsContext() || import.meta.env.DEV}>
            {children(() => props.children)()}
        </Show>
    </teamsContext.Provider>
}

export function useTeams() { return useContext(teamsContext); };