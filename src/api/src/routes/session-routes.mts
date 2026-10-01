import { Router } from 'express'

import { requireSessionToken, type SessionTokenLocals } from '../auth/require-session-token.mts'
import { sessionStateEvent } from '../contracts/session-view.mts'
import { sessionView, SessionRuleError } from '../sessions/session.mts'

import type { SessionTokens } from '../auth/session-token.mts'
import type { ErrorResponse, VoteRequest } from '../contracts/requests.mts'
import type { SessionEvents } from '../sessions/session-events.mts'
import type { SessionService } from '../sessions/session-service.mts'
import type { NextFunction, Request, Response } from 'express'

type SessionRequest = Request<{ id: string }>
type SessionResponse = Response<ErrorResponse, SessionTokenLocals>

// Comments keep proxies from closing an idle stream.
const heartbeatIntervalMs = 25_000

export function sessionRoutes(service: SessionService, events: SessionEvents, tokens: SessionTokens) {
	const router = Router()
	router.use('/:id', requireSessionToken(tokens))

	router.get('/:id/events', (request: SessionRequest, response: SessionResponse) => {
		const { userId } = response.locals.claims
		const session = service.require(request.params.id)

		response.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			'Connection': 'keep-alive',
			'X-Accel-Buffering': 'no',
		})

		let closed = false
		const send = () => {
			response.write(`event: ${sessionStateEvent}\ndata: ${JSON.stringify(sessionView(session, userId))}\n\n`)
			if (session.ended) close()
		}
		const heartbeat = setInterval(() => response.write(': heartbeat\n\n'), heartbeatIntervalMs)
		const unsubscribe = events.subscribe(session.id, send)
		function close() {
			if (closed) return
			closed = true
			clearInterval(heartbeat)
			unsubscribe()
			response.end()
		}

		request.on('close', close)
		send()
	})

	router.post('/:id/vote', (request: Request<{ id: string }, unknown, Partial<VoteRequest> | undefined>, response: SessionResponse) => {
		const { vote } = request.body ?? {}
		if (typeof vote !== 'string') throw new SessionRuleError(400, 'Send a vote.')

		service.vote(request.params.id, response.locals.claims.userId, vote)
		response.status(204).end()
	})

	router.post('/:id/reveal', (request: SessionRequest, response: SessionResponse) => {
		service.reveal(request.params.id, response.locals.claims.userId)
		response.status(204).end()
	})

	router.post('/:id/reset', (request: SessionRequest, response: SessionResponse) => {
		service.reset(request.params.id, response.locals.claims.userId)
		response.status(204).end()
	})

	router.use(sessionErrorHandler)

	return router
}

/** Turns broken session rules into their HTTP status. Anything else is a real error and goes on to Express. */
export function sessionErrorHandler(error: unknown, _request: Request, response: Response<ErrorResponse>, next: NextFunction) {
	if (!(error instanceof SessionRuleError)) {
		next(error)
		return
	}
	response.status(error.status).send({ error: error.message })
}
