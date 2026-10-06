import express, { type NextFunction, type Request, type Response } from 'express'

import { createBot } from './bot/bot.mts'
import { readConfiguration } from './configuration.mts'
import { createSessionService } from './sessions/session-service.mts'
import { createSessionStore } from './sessions/session-store.mts'

const sessionIdleTimeoutMs = 2 * 60 * 60 * 1000
const sweepIntervalMs = 10 * 60 * 1000

const configuration = readConfiguration()
const sessions = createSessionService(createSessionStore({ idleTimeoutMs: sessionIdleTimeoutMs }))

const server = express()
	.disable('x-powered-by')
	.use(logRequest)
	.get(['/', '/health'], (_request, response) => {
		response.send({ status: 'healthy' })
	})

// Registers /api/messages for the bot.
await createBot(server, { sessions }, configuration.logLevel)

server.use(handleUnexpectedError)

setInterval(() => sessions.expireIdle(), sweepIntervalMs).unref()

server.listen(configuration.port, '0.0.0.0', error => {
	if (error) {
		console.error('Could not start the server', error)
		process.exit(1)
	}
	console.info(`TVote API listening on port ${String(configuration.port)}`)
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
		const path = request.originalUrl.split('?')[0] ?? ''
		console.info(`${request.method} ${path} ${String(response.statusCode)} ${String(Math.round(performance.now() - started))}ms`)
	})
	next()
}

function handleUnexpectedError(error: unknown, request: Request, response: Response, _next: NextFunction) {
	console.error(`Unexpected error on ${request.method} ${request.path}`, error)
	if (!response.headersSent) response.status(500).send({ error: 'Something went wrong on our side.' })
}
