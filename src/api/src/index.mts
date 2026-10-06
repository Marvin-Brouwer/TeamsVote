import { createBot } from './bot/bot.mts'
import { readConfiguration } from './configuration.mts'
import { createSessionService } from './sessions/session-service.mts'
import { createSessionStore } from './sessions/session-store.mts'

import type { Express, NextFunction, Request, Response } from 'express'

const sessionIdleTimeoutMs = 2 * 60 * 60 * 1000
const sweepIntervalMs = 10 * 60 * 1000

/**
 * Puts TVote's server side on an Express app: `/health`, and the Teams bot on `/api/messages`.
 * The web app's server runs this as its middleware, ahead of the pages, see `src/web/src/server-middleware`.
 */
export async function mountTVote(app: Express): Promise<void> {
	const configuration = readConfiguration()
	const sessions = createSessionService(createSessionStore({ idleTimeoutMs: sessionIdleTimeoutMs }))

	app
		.disable('x-powered-by')
		.use('/api', logRequest)
		.get('/health', (_request, response) => {
			response.send({ status: 'healthy' })
		})

	// Registers /api/messages for the bot.
	await createBot(app, { sessions }, configuration.logLevel)

	app.use('/api', handleUnexpectedError)

	setInterval(() => sessions.expireIdle(), sweepIntervalMs).unref()
}

/**
 * Logs method, path, status and duration. Never bodies, query strings or headers:
 * those can carry names, ids and tokens, and the privacy policy promises we don't keep any.
 * Only the API: the pages would drown it out.
 */
function logRequest(request: Request, response: Response, next: NextFunction) {
	const started = performance.now()
	response.on('finish', () => {
		const path = request.originalUrl.split('?')[0] ?? ''
		console.info(`${request.method} ${path} ${String(response.statusCode)} ${String(Math.round(performance.now() - started))}ms`)
	})
	next()
}

function handleUnexpectedError(error: unknown, request: Request, response: Response, _next: NextFunction) {
	console.error(`Unexpected error on ${request.method} ${request.originalUrl.split('?')[0] ?? ''}`, error)
	if (!response.headersSent) response.status(500).send({ error: 'Something went wrong on our side.' })
}
