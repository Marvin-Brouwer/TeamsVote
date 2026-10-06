import type { LogLevel } from '@microsoft/teams.common'

export type Configuration = {
	readonly port: number
	readonly logLevel: LogLevel
}

const logLevels = new Set<string>(['error', 'warn', 'info', 'debug', 'trace'])

/**
 * Reads the configuration from the environment. Fails at startup rather than on the first request.
 * The bot's identity (`CLIENT_ID`, `TENANT_ID`, `MANAGED_IDENTITY_CLIENT_ID`) isn't read here, the Teams SDK picks it up itself.
 */
export function readConfiguration(environment: NodeJS.ProcessEnv = process.env): Configuration {
	const logLevel = environment.LOG_LEVEL ?? 'warn'
	if (!logLevels.has(logLevel)) throw new Error(`LOG_LEVEL "${logLevel}" is not one of ${[...logLevels].join(', ')}`)

	return {
		// App Service tells the app which port to listen on.
		port: Number(environment.PORT) || 3978,
		logLevel: logLevel as LogLevel,
	}
}
