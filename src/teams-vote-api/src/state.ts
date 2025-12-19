
export type Submission<T extends 'points' | 't-shirt'> = {
  user: {
    name: string,
    id: string
  },
  score: (T extends 'points' ? number : string) | 'skip' | '?'
}

export type SessionData = { 
  meetingId: string,
  roundKey: string,
  token: string,
  type: 'points' | 't-shirt'
}

export type Session = SessionData & { 
  submissions: Submission<'points' | 't-shirt'>[]
}
export const sessions = new Map<string, Session>();
