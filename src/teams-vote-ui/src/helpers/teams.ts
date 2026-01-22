import * as microsoftTeams from '@microsoft/teams-js';

let teamsContext: microsoftTeams.app.Context | undefined = undefined;

async function getTeamsContextInternal() {
    console.log('TEAMSVOTE', 'calling getTeamsContextInternal')
    if (import.meta.env.DEV && location.host.startsWith('localhost')) return undefined;
    if (!!teamsContext) {
        console.log('TEAMSVOTE', 'returning initialized teamsContext')
        return teamsContext;
    }

    try {
        console.log('TEAMSVOTE', 'initializing teamsContext')
        await microsoftTeams.app.initialize();
        teamsContext = await microsoftTeams.app.getContext();
        return teamsContext;
    } catch (err) {
        if ((err as Error).message === "Initialization Failed. No Parent window found.") return undefined;
        throw err;
    }
}
if (!teamsContext) await getTeamsContextInternal();

export const globalTeamsContext = () => teamsContext;