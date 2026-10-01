import type { SessionTokenClaims, SessionTokens } from './session-token.mts'
import type { ErrorResponse } from '../contracts/requests.mts'
import type { NextFunction, Request, Response } from 'express'

export type SessionTokenLocals = {
	claims: SessionTokenClaims
}

/**
 * Express middleware for the `/:id/...` session routes.
 * Needs `Authorization: Bearer <session token>`, and the token has to be for the session in the URL.
 */
export function requireSessionToken(tokens: SessionTokens) {
	return async (request: Request<{ id: string }>, response: Response<ErrorResponse, SessionTokenLocals>, next: NextFunction) => {
		const [scheme, token] = request.headers.authorization?.split(' ') ?? []
		const claims = scheme?.toLowerCase() === 'bearer' && token ? await tokens.verify(token) : undefined

		if (!claims) {
			response.status(401).send({ error: 'Missing or expired session token. Open the vote again from the card.' })
			return
		}
		if (claims.sessionId !== request.params.id) {
			response.status(403).send({ error: 'This token is for a different vote.' })
			return
		}

		response.locals.claims = claims
		next()
	}
}
