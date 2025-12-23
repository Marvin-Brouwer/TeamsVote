import { Deck } from "./deck";
import { ServerSession } from "./session";
import { Submission } from "./submission";
import { User } from "./user";

export type SessionResponse = ServerSession;

export type StatusResponse = {
    roundKey: string,
    admin: boolean,
    submissions: Submission<Deck>[],
    users: User[]
}

export type AggregateResponse = {
    submissions: Submission<Deck>[],
    average: string | number | undefined
}