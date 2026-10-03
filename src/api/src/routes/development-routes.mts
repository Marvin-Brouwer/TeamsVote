import { Router } from 'express'

import { defaultDeckId, isDeckId } from '../contracts/decks.mts'
import { SessionRuleError } from '../sessions/session.mts'
import { sessionErrorHandler } from './session-routes.mts'

import type { SessionTokens } from '../auth/session-token.mts'
import type { DevelopmentJoinRequest, DevelopmentJoinResponse } from '../contracts/requests.mts'
import type { SessionService } from '../sessions/session-service.mts'
import type { Request, Response } from 'express'

type JoinRequest = Request<{ id?: string }, DevelopmentJoinResponse, Partial<DevelopmentJoinRequest> | undefined>

/**
 * Stand-ins for what the bot does, so the web app can be developed in a plain browser.
 * Only mounted when `NODE_ENV=development`. Anyone can claim to be anyone here.
 */
export function developmentRoutes(sessions: SessionService, tokens: SessionTokens) {
	const router = Router()

	async function respondWithToken(response: Response<DevelopmentJoinResponse>, sessionId: string, user: { id: string, name: string }) {
		const token = await tokens.mint({ sessionId, userId: user.id, userName: user.name })
		response.send({ sessionId, token })
	}

	function readUser(request: JoinRequest) {
		const user = request.body?.user
		if (!user?.id || !user.name) throw new SessionRuleError(400, 'Send a user with an id and a name.')
		return { id: user.id, name: user.name }
	}

	// Starts a session, like the start dialog would.
	router.post('/sessions', async (request: JoinRequest, response: Response<DevelopmentJoinResponse>) => {
		const user = readUser(request)
		const deck = request.body?.deck
		const session = sessions.start({
			topic: request.body?.topic ?? 'https://example.atlassian.net/browse/DEV-1',
			deck: isDeckId(deck) ? deck : defaultDeckId,
			admin: user,
		})
		await respondWithToken(response, session.id, user)
	})

	// Joins a session, like clicking "Vote" on the card would.
	router.post('/sessions/:id/join', async (request: JoinRequest, response: Response<DevelopmentJoinResponse>) => {
		const user = readUser(request)
		const sessionId = request.params.id ?? ''
		sessions.join(sessionId, user)
		await respondWithToken(response, sessionId, user)
	})

	// Accepts, like the admin's dialog submit to the bot would.
	router.post('/sessions/:id/accept', (request: JoinRequest, response: Response) => {
		const { average } = sessions.accept(request.params.id ?? '', readUser(request).id)
		response.send({ average })
	})

	router.use(sessionErrorHandler)
	return router
}
