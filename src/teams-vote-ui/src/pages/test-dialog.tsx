import { dialog } from "@microsoft/teams-js";
import type { Component } from "solid-js";

export const TestDialog: Component = () => <div class="view loading-spinner">
    <fluent-button onClick={() => dialog.url.submit({
        result: "success",
        action: "startVote",
        estimate: 5
    })}>
        Test
    </fluent-button>
</div>