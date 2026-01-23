import { onMount, type Component } from "solid-js";
import { useSession } from "../contexts/session-context";
import { useTeams } from "../contexts/teams-context";

export const Spinner: Component = () => {

    const { session } = useSession();
    const { teamsDialog } = useTeams()!;

    onMount(() => {
        if (!session.admin) return console.log('no admin', session);
        console.log('sending bot command')
        teamsDialog.url.submit({
            command: "startVote2"
        });
    })

    return <div class="view tab-spinner">
        <fluent-progress-ring />
    </div>
}