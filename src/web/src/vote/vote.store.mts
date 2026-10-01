import type { Store } from '@rooted/store'
import type { SessionView } from '@teams-vote/api/contracts'

/** The latest state of the session, as the server sent it for this participant. Empty until the first state arrives. */
export type SessionStore = Store<SessionView | undefined>

export type ConnectionState = 'connecting' | 'connected' | 'reconnecting'
