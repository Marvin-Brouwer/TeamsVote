import { Deck } from "./deck"
import { Submission } from "./submission"
import { User } from "./user"

export type SessionData = { 
  meetingId: string,
  roundKey: string,
  token: string,
  type: Deck
}

export type ServerSession = SessionData & { 
  users: Map<string, User>
  submissions: Map<string, Submission<Deck>>
}

export type ClientSession = SessionData & { 
  users: User[]
  submissions: Submission<Deck>[]
}
