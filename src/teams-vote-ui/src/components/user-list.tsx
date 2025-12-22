import { Component, createEffect, createSignal, onCleanup } from "solid-js";
import { ButtonAppearance, DataGrid } from "@fluentui/web-components";
import { useSession } from "../contexts/session-context";

import "./vote.css";

export const UserList: Component = () => {

    const { session } = useSession()!;
    const [dataGridRef, setDataGridRef] = createSignal<DataGrid>()

    createEffect(() => {
        const dataGrid = dataGridRef();
        if (!dataGrid) return;
        if (!session.submissions) return

        dataGrid.rowsData = session.users
            .map(user => ({
                user: user.name,
                status: session.submissions.find(submission => submission.user.id === user.id)?.score ?? 'pending'
            }))
    })
    
    return <div class="users">
        <fluent-data-grid generate-header="none" ref={setDataGridRef} />
    </div>
}