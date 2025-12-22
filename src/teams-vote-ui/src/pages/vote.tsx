import { DataGrid } from "@fluentui/web-components";
import { Show, type Component } from "solid-js";
import { AdminPanel, VotePanel } from "../components/vote";
import { useSession } from "../contexts/session-context";
import { UserList } from "../components/user-list";

export const VoterView: Component = () => {

    // TODO render link if roundKey is url
    const { session } = useSession();

    return <>
        <h2>{session.roundKey}</h2>
        {/* TODO link preview? */}
        <fluent-divider />
        <UserList />
        <p></p>
        {/* TODO: Pin to bottom */}
        <fluent-card>
            <VotePanel />
            <Show when={session.admin}>
                <AdminPanel />
            </Show>
        </fluent-card>
    </>
}