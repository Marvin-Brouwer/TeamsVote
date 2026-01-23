import type {
    StartRequest, SessionResponse, SubmissionRequest, StatusRequest, AggregateResponse, StatusResponse
} from '@teams-vote/data';

const apiUrl = import.meta.env.VITE_API_URL as string;

export const api = {
    async checkHealth() {
        const response = await fetch(`${apiUrl}/health`, {
            method: 'GET'
        }).then(async httpResponse => {
            if (!httpResponse.ok) {
                if (import.meta.env.DEV) alert(await httpResponse.text())
                return false;
            };
            return true;
        });

        return response;
    },
    async requestSessionStart(startRequest: StartRequest, signal: AbortSignal) {
        const response = await fetch(`${apiUrl}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(startRequest),
            signal
        }).then(async httpResponse => {
            if (!httpResponse.ok) throw await httpResponse.text();
            return httpResponse.json() as Promise<SessionResponse>;
        });

        return response;
    },
    async submitVote(submissionRequest: SubmissionRequest, signal: AbortSignal) {
        await fetch(`${apiUrl}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionRequest),
            signal
        }).then(async httpResponse => {
            if (!httpResponse.ok) throw await httpResponse.text();
        });
    },
    async requestReset(resetRequest: StatusRequest, signal: AbortSignal) {
        await fetch(`${apiUrl}/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resetRequest),
            signal
        }).then(async httpResponse => {
            if (!httpResponse.ok) throw await httpResponse.text();
        });
    },
    async requestAggregate(aggregateRequest: StatusRequest, signal: AbortSignal) {
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
    },
    async acceptScore(acceptRequest: StatusRequest, signal: AbortSignal) {
        await fetch(`${apiUrl}/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(acceptRequest),
            signal
        }).then(async httpResponse => {
            if (!httpResponse.ok) throw await httpResponse.text();
        });
    },
    async requestStatus(statusRequest: StatusRequest, signal: AbortSignal) {
        const response = await fetch(`${apiUrl}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statusRequest),
            signal
        }).then(async httpResponse => {
            if (!httpResponse.ok) throw await httpResponse.text();
            return httpResponse.json() as Promise<StatusResponse>;
        });

        return response;
    }
};