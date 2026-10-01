import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'

import { createSessionTokens } from './auth/session-token.mts'
import { createBot } from './bot/bot.mts'
import { readConfiguration } from './configuration.mts'
import { developmentRoutes } from './routes/development-routes.mts'
import { sessionRoutes } from './routes/session-routes.mts'
import { createSessionEvents } from './sessions/session-events.mts'
import { createSessionService } from './sessions/session-service.mts'
import { createSessionStore } from './sessions/session-store.mts'

const sessionIdleTimeoutMs = 2 * 60 * 60 * 1000
const sweepIntervalMs = 10 * 60 * 1000

const configuration = readConfiguration()
const events = createSessionEvents()
const sessions = createSessionService(createSessionStore({ idleTimeoutMs: sessionIdleTimeoutMs }), events)
const tokens = createSessionTokens(configuration.sessionTokenSecret)

const server = express()
	.disable('x-powered-by')
	.use(logRequest)
	.get(['/', '/health'], (_request, response) => {
		response.send({ status: 'healthy' })
	})

// Only for what the web app calls. Bot activities are bigger and bring their own body parsing.
const browserMiddleware = [
	cors({ origin: configuration.webUrl, methods: ['GET', 'POST'], allowedHeaders: ['Authorization', 'Content-Type'], maxAge: 600 }),
	express.json({ limit: '4kb' }),
]

server.use('/api/sessions', ...browserMiddleware, sessionRoutes(sessions, events, tokens))
if (configuration.development) server.use('/dev', ...browserMiddleware, developmentRoutes(sessions, tokens))

// Registers /api/messages for the bot.
await createBot(server, { sessions, tokens, webUrl: configuration.webUrl }, configuration.logLevel)

server.use(handleUnexpectedError)

setInterval(() => sessions.expireIdle(), sweepIntervalMs).unref()

server.listen(configuration.port, '0.0.0.0', error => {
	if (error) {
		console.error('Could not start the server', error)
		process.exit(1)
	}
	console.info(`TeamsVote API listening on port ${configuration.port}, web app at ${configuration.webUrl}`)
})

/**
 * Logs method, path, status and duration. Never bodies, query strings or headers:
 * those can carry names, ids and tokens, and the privacy policy promises we don't keep any.
 */
function logRequest(request: Request, response: Response, next: NextFunction) {
	if (request.path === '/health') {
		next()
		return
	}

	const started = performance.now()
	response.on('finish', () => {
		const path = (request.originalUrl.split('?')[0] ?? '').replace(/\/sessions\/[^/]+/, '/sessions/:id')
		console.info(`${request.method} ${path} ${response.statusCode} ${Math.round(performance.now() - started)}ms`)
	})
	next()
}

function handleUnexpectedError(error: unknown, request: Request, response: Response, _next: NextFunction) {
	console.error(`Unexpected error on ${request.method} ${request.path}`, error)
	if (!response.headersSent) response.status(500).send({ error: 'Something went wrong on our side.' })
}
