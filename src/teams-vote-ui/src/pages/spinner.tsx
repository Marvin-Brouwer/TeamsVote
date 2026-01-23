import { onMount, type Component } from "solid-js";
import { useTeams } from "../contexts/teams-context";

export const Spinner: Component = () => {

    const { teamsDialog, teamsContext } = useTeams()!;

    onMount(() => {

        window.setTimeout(() => {
            console.log('sending bot command', JSON.stringify(teamsContext()))
            try {
                teamsDialog.url.submit({
                    command: 'test2'
                })
            } catch (e) {
                console.error('submittask', e)
            }
        }, 1000)
    })

    return <div class="view tab-spinner">
        <fluent-progress-ring />
    </div>
}