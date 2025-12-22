import { Accessor, Component, createMemo, mapArray, Show } from "solid-js";
import { useSession } from "../contexts/session-context";

import "./vote.css";

export const UserList: Component = () => {

    const { session, showScores, aggregate } = useSession()!;
    const gridData = createMemo(() => {
        if (!session.users) return
        if (!session.submissions) return

        const data = session.users
            .map<UserGridStatus>(user => ({
                user: user,
                score: session.submissions.find(submission => submission.user.id === user.id)?.score
            }))

        return data;
    })

    return <div class="users">
        <UserStatusGrid data={gridData} showScores={showScores} />
        <TotalsRow showScores={showScores()} aggregate={aggregate()} />
    </div>
}

function formatScore(score: string | number | undefined, showScores: boolean) {
    if (score === 'skip') return <fluent-badge appearance="neutral">skipped</fluent-badge>
    if (score === undefined) return <fluent-badge appearance="neutral">{showScores ? 'skipped' : 'pending'}</fluent-badge>
    if (showScores) return <fluent-badge appearance="accent">{score}</fluent-badge>

    return <fluent-badge appearance="neutral">voted</fluent-badge>
}

type UserGridStatus = {
    user: { id: string, name: string }
    score: string | number | undefined,
}
const UserStatusGrid: Component<{ data: Accessor<UserGridStatus[] | undefined>, showScores: Accessor<boolean> }> = (props) => {

    // Build the rows ourselves, because the fastUI keeps rerendering on data change.
    const gridRows = mapArray(
        () => (props.data() ?? []),
        (row, i) => <fluent-data-grid-row rowIndex={i()}>
            <fluent-data-grid-cell grid-column="1" cell-type="columnheader">
                {row.user.name}
            </fluent-data-grid-cell>
            <fluent-data-grid-cell grid-column="2" cell-type="default">
                {formatScore(row.score, props.showScores())}
            </fluent-data-grid-cell>
        </fluent-data-grid-row>
    )

    return <fluent-data-grid generate-header="none">
        {gridRows()}
    </fluent-data-grid>

}
const TotalsRow: Component<{ showScores: boolean, aggregate: number | string | undefined }> = (props) => {


    return <Show when={props.showScores && props.aggregate !== undefined}>
        <p>&nbsp;</p>
        <fluent-data-grid generate-header="none">
            <fluent-data-grid-row rowIndex={-1}>
                <fluent-data-grid-cell grid-column="1" cell-type="columnheader">
                    Average
                </fluent-data-grid-cell>
                <fluent-data-grid-cell grid-column="2" cell-type="default">
                    <fluent-badge appearance="accent">{props.aggregate}</fluent-badge>
                </fluent-data-grid-cell>
            </fluent-data-grid-row>
        </fluent-data-grid>
    </Show>
}