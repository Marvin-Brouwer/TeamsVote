import { type Accessor, children, createContext, createSignal, onMount, type ParentComponent, Show, useContext } from "solid-js";

import * as microsoftTeams from "@microsoft/teams-js";
import { useLocation } from '@solidjs/router';

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

const testTeamsContext: UseTeamsContext | undefined = import.meta.env.PROD ? undefined : ({
    teamsContext: () => ({
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
        dialogParameters: {}
    }),
    teamsTasks: microsoftTeams.tasks,
    getAuthToken() {
        return Promise.resolve('fake-auth')
    },
})

export const TeamsProvider: ParentComponent = (props) => {

    const [getTeamsContext, setTeamsContext] = createSignal<TeamsContext | undefined>(undefined)

    onMount(async () => {
        const windowTeamsContext = await getContext();
        setTeamsContext(windowTeamsContext);
    });

    async function getAuthToken() {
        return await microsoftTeams.authentication.getAuthToken({
            resources: ["https://graph.microsoft.com"],
        });
    };

    return <teamsContext.Provider value={!getTeamsContext() ? testTeamsContext : { teamsContext: getTeamsContext as Accessor<TeamsContext>, teamsTasks: microsoftTeams.tasks, getAuthToken }}>
        <Show when={import.meta.env.DEV && getTeamsContext()?.app.sessionId === 'fake-session'}>
            <p>DEV MODE: Fake session</p>
        </Show>
        <Show when={!!getTeamsContext() || import.meta.env.DEV}>
            {children(() => props.children)()}
        </Show>
    </teamsContext.Provider>
}

export function useTeams() { return useContext(teamsContext); };