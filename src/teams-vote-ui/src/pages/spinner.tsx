import { onMount, type Component } from "solid-js";
import * as microsoftTeams from '@microsoft/teams-js';

export const Spinner: Component = () => {


    onMount(() => {
        console.log('sending bot command')

        try {
            microsoftTeams.meeting.getMeetingDetails((e, d) => console.log(e, d))
        }
        catch (e) {
            console.error('too bad', e)
        }


        try {
            microsoftTeams.dialog.url.submit({
                command: 'test2'
            }, import.meta.env.VITE_BOT_ID)
        } catch (e) {
            console.error('submittask', e)
        }
    })

    return <div class="view tab-spinner">
        <fluent-progress-ring />
    </div>
}