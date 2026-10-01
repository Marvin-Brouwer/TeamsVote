import { randomBytes } from 'node:crypto'

import type { LogLevel } from '@microsoft/teams.common'

export type Configuration = {
	readonly port: number
	readonly development: boolean
	/** Origin of the web app. Used for CORS and for the dialog URLs the bot hands out. */
	readonly webUrl: string
	readonly sessionTokenSecret: string
	readonly logLevel: LogLevel
}

const logLevels = new Set<string>(['error', 'warn', 'info', 'debug', 'trace'])

/**
 * Reads the configuration from the environment. Fails at startup rather than on the first request.
 * `CLIENT_ID`, `CLIENT_SECRET` and `TENANT_ID` aren't read here, the Teams SDK picks those up itself.
 */
export function readConfiguration(environment: NodeJS.ProcessEnv = process.env): Configuration {
	const development = environment.NODE_ENV === 'development'

	const webUrl = environment.WEB_URL ?? (development ? 'http://localhost:5173' : undefined)
	if (!webUrl) throw new Error('WEB_URL is not set. It should be the origin of the web app, like https://teamsvote.example.com')

	// A random secret in development means tokens don't survive a restart, which is fine there.
	const sessionTokenSecret = environment.SESSION_TOKEN_SECRET ?? (development ? randomBytes(48).toString('base64') : undefined)
	if (!sessionTokenSecret) throw new Error('SESSION_TOKEN_SECRET is not set. Generate one with: openssl rand -base64 48')

	const logLevel = environment.LOG_LEVEL ?? 'warn'
	if (!logLevels.has(logLevel)) throw new Error(`LOG_LEVEL "${logLevel}" is not one of ${[...logLevels].join(', ')}`)

	return {
		port: Number(environment.PORT) || 3978,
		development,
		webUrl: new URL(webUrl).origin,
		sessionTokenSecret,
		logLevel: logLevel as LogLevel,
	}
}
