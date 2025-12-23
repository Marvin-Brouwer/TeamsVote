import { Show, type Component } from "solid-js";
import { AdminPanel, VotePanel } from "../components/vote";
import { useSession } from "../contexts/session-context";
import { UserList } from "../components/user-list";
import { KeyDisplay } from "../components/key-display";

export const VoterView: Component = () => {

    const { session } = useSession();

    return <div class="view" style={import.meta.env.DEV && session.meetingId === 'test-channel' ? '--vote-height: calc(100% - 70px);' : undefined}>
        <div class="content">
            <h2><KeyDisplay key={session.roundKey} /></h2>
            {/* TODO link preview? */}
            <fluent-divider />
            <UserList />
        </div>
        <div class="menu">
            <fluent-card>
                <VotePanel />
                <Show when={session.admin}>
                    <AdminPanel />
                </Show>
            </fluent-card>
        </div>
    </div>
}