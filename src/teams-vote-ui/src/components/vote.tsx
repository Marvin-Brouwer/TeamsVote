import { Component, onCleanup, Show } from "solid-js";
import { ButtonAppearance } from "@fluentui/web-components";
import { useSession } from "../contexts/session-context";

import "./vote.css";
import { AggregateResponse, StatusRequest, SubmissionRequest } from '@teams-vote/data';

const apiUrl = import.meta.env.VITE_API_URL as string;

export const VotePanel: Component = () => {

    const { session, showScores } = useSession()!;

    const abortController = new AbortController();
    onCleanup(() => abortController.abort('onCleanup'))

    async function vote(score: number | string) {
        await submitVote({ ...session, score }, abortController.signal)
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
        <fluent-button disabled={showScores()|| session.ended} appearance={matchAppearance(1)} onClick={() => vote(1)}>1</fluent-button>
        <fluent-button disabled={showScores()|| session.ended} appearance={matchAppearance(2)} onClick={() => vote(2)}>2</fluent-button>
        <fluent-button disabled={showScores()|| session.ended} appearance={matchAppearance(3)} onClick={() => vote(3)}>3</fluent-button>
        <fluent-button disabled={showScores()|| session.ended} appearance={matchAppearance(5)} onClick={() => vote(5)}>5</fluent-button>
        <fluent-button disabled={showScores()|| session.ended} appearance={matchAppearance(8)} onClick={() => vote(8)}>8</fluent-button>
        <fluent-button disabled={showScores()|| session.ended} appearance={matchAppearance(13)} onClick={() => vote(13)}>13</fluent-button>
        <fluent-button disabled={showScores()|| session.ended} appearance={matchAppearance(20)} onClick={() => vote(20)}>20</fluent-button>
        <fluent-button disabled={showScores()|| session.ended} appearance={matchAppearance(100)} onClick={() => vote(100)}>100</fluent-button>
        <fluent-button disabled={showScores()|| session.ended} appearance={matchAppearance('?')} onClick={() => vote('?')}>?</fluent-button>
    </div>
}
export const AdminPanel: Component = () => {
    const { session, showScores, setShowScores, setAggregate } = useSession()!;

    const abortController = new AbortController();
    onCleanup(() => abortController.abort('onCleanup'))

    async function vote(score: number | string) {
        await submitVote({ ...session, score }, abortController.signal)
    }
    async function reset() {
        setShowScores(false)
        await requestReset(session, abortController.signal)
    }
    async function show() {
        setAggregate(await requestAggregate(session, abortController.signal))
        setShowScores(true)
    }
    async function accept() {
        await acceptScore(session, abortController.signal)
        setShowScores(true)
    }

    const appearance: ButtonAppearance = "neutral"
    return <>
        <fluent-divider />
        <div class="admin">
            <fluent-button appearance={showScores() ? "accent" as ButtonAppearance : appearance} autofocus={true} disabled={!showScores() || session.ended} onClick={accept}>{ session.submissions.length ? "Accept" : "Close" }</fluent-button>
            <Show when={!showScores()}><fluent-button disabled={showScores() || session.ended} appearance={"accent" as ButtonAppearance} autofocus={true} onClick={show}>Show</fluent-button></Show>
            <Show when={showScores()}><fluent-button disabled={!showScores() || session.ended} appearance={appearance} onclick={reset}>Re-vote</fluent-button></Show>
            <fluent-button disabled={showScores() || session.ended}  appearance={appearance} onClick={() => vote('skip')}>Skip</fluent-button>
        </div>
    </>
}

async function submitVote(submissionRequest: SubmissionRequest, signal: AbortSignal) {
    await fetch(`${apiUrl}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionRequest),
        signal
    }).then(async httpResponse => {
        if (!httpResponse.ok) throw await httpResponse.text();
    });
}

async function requestReset(resetRequest: StatusRequest, signal: AbortSignal) {
    await fetch(`${apiUrl}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetRequest),
        signal
    }).then(async httpResponse => {
        if (!httpResponse.ok) throw await httpResponse.text();
    });
}

async function requestAggregate(aggregateRequest: StatusRequest, signal: AbortSignal) {
    const response = await fetch(`${apiUrl}/aggregate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aggregateRequest),
        signal
    }).then(async httpResponse => {
        if (!httpResponse.ok) throw await httpResponse.text();
        return httpResponse.json() as Promise<AggregateResponse>;
    });
    return response.average;
}

async function acceptScore(acceptRequest: StatusRequest, signal: AbortSignal) {
    await fetch(`${apiUrl}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acceptRequest),
        signal
    }).then(async httpResponse => {
        if (!httpResponse.ok) throw await httpResponse.text();
    });
}