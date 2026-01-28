// src/server.ts
import { Router } from "express";
import { FastifyInstance } from "fastify";
import { v4 as uuid } from "uuid";
import { Mutex } from "async-mutex";
import { calculateAverage, validateScore } from "../utilities/average.js";
import { AggregateResponse, ServerSession, SessionResponse, StartRequest, StatusRequest, StatusResponse, SubmissionRequest } from "@teams-vote/data";

const sessionLocks = new Map<string, Mutex>();
const sessions = new Map<string, ServerSession>();

function getMutex(meetingId: string) {
    let mutex = sessionLocks.get(meetingId);
    if (!mutex) {
        mutex = new Mutex();
        sessionLocks.set(meetingId, mutex);
    }
    return mutex;
}

const router = Router();
router.post('/start', (req, res) => {
    const body = req.body as StartRequest;
    const { roundKey, meetingId, selectedDeck, user } = body;

    if (!meetingId) return res.status(400).send({ error: "meetingId required" });
    if (!roundKey) return res.status(400).send({ error: "roundKey required" });
    if (!selectedDeck) return res.status(400).send({ error: "selectedDeck required" });
    if (!user) return res.status(400).send({ error: "user required" });

    const roundToken = uuid();

    const session: ServerSession = {
        meetingId,
        roundKey,
        token: roundToken,
        selectedDeck,
        users: new Map(),
        submissions: new Map()
    }

    session.users.set(user.id, {
        ...user,
        admin: true
    })

    sessions.set(meetingId, session);

    return res.status(200).send(session as SessionResponse);
})

router.post("/submit", (req, res) => {
    const body = req.body as SubmissionRequest;
    const { meetingId, token, user, score } = body;

    const mutex = getMutex(meetingId);

    return mutex.runExclusive(() => {
        const session = sessions.get(meetingId);
        if (!session || session.token !== token) {
            return res.status(404).send({ error: "Session not found" });
        }

        if (!validateScore(session.selectedDeck, score)) {
            return res.status(403).send({ error: "Incorrect score" });
        }

        session.submissions.set(user.id, { user, score });
        sessions.set(meetingId, session);

        return res.status(403).send();
    });
});

router.post("/status", (req, res) => {
    const body = req.body as StatusRequest;
    const { meetingId, token, user } = body;

    const mutex = getMutex(meetingId);

    return mutex.runExclusive(() => {

        const session = sessions.get(meetingId);
        if (!session || session.token !== token) {
            return res.status(404).send({ error: "Session not found" });
        }

        const currentUser = session.users.get(user.id)
        if (!currentUser) {
            session.users.set(user.id, user)
        }

        const submissions = Array.from(session.submissions.values());
        const users = Array.from(session.users.values());

        console.log(currentUser)
        const result: StatusResponse = {
            roundKey: session.roundKey,
            admin: (currentUser ?? user)?.admin ?? false,
            submissions,
            users
        }

        return res.status(200).send(result);
    });
});

router.post("/aggregate", (req, res) => {
    const body = req.body as StatusRequest;
    const { meetingId, token, user } = body;

    const session = sessions.get(meetingId);
    if (!session || session.token !== token) {
        return res.status(404).send({ error: "Session not found" });
    }
    const currentUser = session.users.get(user.id)
    if (!currentUser) {
        return res.status(404).send({ error: "Session not found" });
    }
    if (!currentUser.admin) {
        return res.status(403).send({ error: "User is no admin" });
    }

    const submissions = Array.from(session.submissions.values());
    const result: AggregateResponse = {
        submissions,
        average: calculateAverage(session.selectedDeck, submissions)
    }

    return res.status(200).send(result);
});

router.post("/accept", (req, res) => {
    const body = req.body as StatusRequest;
    const { meetingId, token, user } = body;

    const session = sessions.get(meetingId);
    if (!session || session.token !== token) {
        return res.status(404).send({ error: "Session not found" });
    }
    const currentUser = session.users.get(user.id)
    if (!currentUser) {
        return res.status(404).send({ error: "Session not found" });
    }
    if (!currentUser.admin) {
        return res.status(403).send({ error: "User is no admin" });
    }

    sessions.delete(meetingId);

    return res.status(200).send();
});

router.post("/reset", (req, res) => {
    const body = req.body as StatusRequest;
    const { meetingId, token, user } = body;

    const session = sessions.get(meetingId);
    if (!session || session.token !== token) {
        return res.status(404).send({ error: "Session not found" });
    }
    const currentUser = session.users.get(user.id)
    if (!currentUser) {
        return res.status(404).send({ error: "Session not found" });
    }
    if (!currentUser.admin) {
        return res.status(403).send({ error: "User is no admin" });
    }

    session.submissions.clear();
    sessions.set(meetingId, session);

    return res.status(200).send();
});

export const sessionRoutes = router;