import { Deck } from "./deck";
import { SessionData } from "./session";
import { Submission } from "./submission";
import { User } from "./user";

export type StartRequest = { 
    roundKey: string, 
    meetingId: string, 
    selectedDeck: Deck, 
    user: User 
}

export type StatusRequest = Omit<SessionData, 'selectedDeck'>  & { user: User }
export type SubmissionRequest = SessionData & Submission<Deck>