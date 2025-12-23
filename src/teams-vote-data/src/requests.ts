import { Deck } from "./deck";
import { SessionData } from "./session";
import { Submission } from "./submission";
import { User } from "./user";

export type StartRequest = { 
    roundKey: string, 
    meetingId: string, 
    type: Deck, 
    user: User 
}

export type StatusRequest = SessionData & { user: User }
export type SubmissionRequest = SessionData & Submission<Deck>