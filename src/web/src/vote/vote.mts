import { component } from '@rooted/components'
import { createStore } from '@rooted/store'

import { sessionClient } from '../_shared/api/api-client.mts'
import { followSession } from '../_shared/api/session-stream.mts'
import { Notice } from '../_shared/feedback/notice.mts'
import { connectTeams } from '../_shared/teams/teams-host.mts'
import { OpenInTeams } from '../_shared/teams/open-in-teams.mts'
import { WakingUp } from '../_shared/waking-up/waking-up.mts'
import { VoteBoard } from './vote-board.mts'

import type { ConnectionState, SessionStore } from './vote.store.mts'

export type VotePageOptions = {
	readonly sessionId: string
}

/** Connects to Teams and to the session, then hands over to the board once the first state arrives. */
export const VotePage = component<VotePageOptions>({
	name: 'vote-page',
	async onMount({ replace, create, options, signal }) {
		replace(create(WakingUp))

		const host = await connectTeams()
		if (host.kind === 'browser') {
			replace(create(OpenInTeams))
			return
		}

		const token = await sessionToken(options.sessionId, host.kind === 'development')
		if (!token) {
			replace(create(Notice, { intent: 'error', message: 'This link is missing its key. Open the vote again from the card in the chat.' }))
			return
		}

		const client = sessionClient(options.sessionId, token)
		const session: SessionStore = createStore()
		const connection = createStore<ConnectionState>('connecting')

		session.on('change', signal, ({ detail }) => {
			if (!detail.state || connection.value !== 'connecting') return
			connection.update(() => 'connected')
			replace(create(VoteBoard, { session, connection, client, host }))
		})

		void followSession(client, signal, {
			onState: view => {
				session.update(() => view)
			},
			onConnectionChange: connected => {
				if (connection.value === 'connecting') return
				connection.update(() => connected ? 'connected' : 'reconnecting')
			},
			onRejected: error => {
				replace(create(Notice, { intent: 'error', message: error.message }))
			},
		})
	},
})

/** The token sits in the URL fragment, where the bot put it. In development, the fake bot hands one out. */
async function sessionToken(sessionId: string, development: boolean): Promise<string | undefined> {
	const fromFragment = new URLSearchParams(window.location.hash.slice(1)).get('token')
	if (fromFragment) return fromFragment
	if (!development || !import.meta.env.DEV) return undefined

	const { joinAsDevelopmentUser } = await import('../_shared/teams/development-host.mts')
	return await joinAsDevelopmentUser(sessionId)
}
