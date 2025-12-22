export type User = {
  name: string,
  id: string
  admin?: boolean | undefined
}
export type Deck = 'fibonacci' | 'modified-fibonacci' | 't-shirt'
export type Submission<T extends Deck> = {
  user: User,
  score: (T extends 't-shirt' ? string : number) | 'skip' | '?'
}

export type SessionData = { 
  meetingId: string,
  roundKey: string,
  token: string,
  type: Deck
}

export type SessionRequest = SessionData & {
  user: User
}

export type Session = SessionData & { 
  users: Map<string, User>
  submissions: Map<string, Submission<Deck>>
}
export const sessions = new Map<string, Session>();
