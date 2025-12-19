import { children, createContext, createSignal, onMount, type ParentComponent, useContext } from "solid-js";

import * as microsoftTeams from "@microsoft/teams-js";

export type TeamsContext = microsoftTeams.app.Context

const teamsContext = createContext<TeamsContext>()

async function getContext() {
     try{
        await microsoftTeams.app.initialize();
        return await microsoftTeams.app.getContext();
    } catch(err) {
        if((err as Error).message === "Initialization Failed. No Parent window found.") return undefined;
        throw err;
    }
}

export const TeamsProvider: ParentComponent = (props) => {

    const [context, setContext] = createSignal<typeof teamsContext.defaultValue>(teamsContext.defaultValue)

	onMount(async () => {
		const windowTeamsContext = await getContext();
        if (import.meta.env.DEV && !windowTeamsContext) {
            // TODO REDIRECT IF NOT DEV
            return setContext(() => ({
                app: {
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
                dialogParameters: { }
            }))
        } 
        setContext(windowTeamsContext);
	});

	return <teamsContext.Provider value={context()}>
        {import.meta.env.DEV && context()?.app.sessionId === 'fake-session' && <p>DEV MODE: Fake session</p>}
		{context() && children(() => props.children)()}
	</teamsContext.Provider>
}

export function useTeams() { return useContext(teamsContext); };