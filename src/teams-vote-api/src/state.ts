
export type Deck = 'fibonacci' | 'modified-fibonacci' | 't-shirt'
export type Submission<T extends Deck> = {
  user: {
    name: string,
    id: string
  },
  score: (T extends 't-shirt' ? string : number) | 'skip' | '?'
}

export type SessionData = { 
  meetingId: string,
  roundKey: string,
  token: string,
  type: Deck
}

export type Session = SessionData & { 
  submissions: Map<string, Submission<Deck>>
}
export const sessions = new Map<string, Session>();
