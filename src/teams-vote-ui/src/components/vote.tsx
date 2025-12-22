import { Component, onCleanup } from "solid-js";
import { ButtonAppearance } from "@fluentui/web-components";
import { useSession } from "../contexts/session-context";

import "./vote.css";

const apiUrl = import.meta.env.VITE_API_URL as string;

export const VotePanel: Component = () => {

    const { session } = useSession()!;

    const abortController = new AbortController();
    onCleanup(() => abortController.abort('onCleanup'))

    async function vote(score: number | string) {
        await submitVote(session.meetingId, session.token, session.user, score, abortController.signal)
    }

    const selectedAppearance: ButtonAppearance = "accent"
    const neutralAppearance: ButtonAppearance = "neutral"
    function matchAppearance(score: string | number) {
        const submission = session.submissions
            .find(submission => submission.user.id === session.user.id);
        if (!submission) return neutralAppearance;
        if (submission.score === score) return selectedAppearance;

        return neutralAppearance;
    }
    return <div class="cards">
        <fluent-button appearance={matchAppearance(1)} onClick={() => vote(1)}>1</fluent-button>
        <fluent-button appearance={matchAppearance(2)} onClick={() => vote(2)}>2</fluent-button>
        <fluent-button appearance={matchAppearance(3)} onClick={() => vote(3)}>3</fluent-button>
        <fluent-button appearance={matchAppearance(5)} onClick={() => vote(5)}>5</fluent-button>
        <fluent-button appearance={matchAppearance(8)} onClick={() => vote(8)}>8</fluent-button>
        <fluent-button appearance={matchAppearance(13)} onClick={() => vote(13)}>13</fluent-button>
        <fluent-button appearance={matchAppearance(20)} onClick={() => vote(20)}>20</fluent-button>
        <fluent-button appearance={matchAppearance(100)} onClick={() => vote(100)}>100</fluent-button>
        <fluent-button appearance={matchAppearance('?')} onClick={() => vote('?')}>?</fluent-button>
    </div>
}
export const AdminPanel: Component = () => {
    const appearance: ButtonAppearance = "neutral"
    return <>
        <fluent-divider />
        <div class="admin">
            <fluent-button appearance={appearance} autofocus>Accept</fluent-button> {" "}
            <fluent-button appearance={appearance}>Re-vote</fluent-button>
            <fluent-button appearance={appearance}>Skip</fluent-button>
        </div>
    </>
}

async function submitVote(meetingId: string, token: string, user: { id: string, name: string }, score: number | string, signal: AbortSignal) {
    const response = await fetch(`${apiUrl}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId, token, user, score }),
        signal
    }).then(async httpResponse => {
        if (!httpResponse.ok) throw await httpResponse.text();
        return httpResponse.json();
    });
    return response;
}