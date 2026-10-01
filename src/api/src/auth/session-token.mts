import { jwtVerify, SignJWT } from 'jose'

/**
 * What a session token says. The bot mints one when someone opens the vote dialog,
 * using the identity Microsoft vouches for on that bot turn. The web app can't make one up.
 */
export type SessionTokenClaims = {
	readonly sessionId: string
	readonly userId: string
	readonly userName: string
}

const issuer = 'teams-vote-api'
const audience = 'teams-vote-web'
const algorithm = 'HS256'

export const sessionTokenLifetimeSeconds = 2 * 60 * 60

export function createSessionTokens(secret: string) {
	if (secret.length < 32) throw new Error('SESSION_TOKEN_SECRET has to be at least 32 characters long.')
	const key = new TextEncoder().encode(secret)

	return {
		async mint({ sessionId, userId, userName }: SessionTokenClaims): Promise<string> {
			return await new SignJWT({ sid: sessionId, name: userName })
				.setProtectedHeader({ alg: algorithm })
				.setSubject(userId)
				.setIssuer(issuer)
				.setAudience(audience)
				.setIssuedAt()
				.setExpirationTime(`${sessionTokenLifetimeSeconds}s`)
				.sign(key)
		},

		/** Gives back the claims, or `undefined` for anything that isn't a valid, unexpired token of ours. */
		async verify(token: string): Promise<SessionTokenClaims | undefined> {
			try {
				const { payload } = await jwtVerify(token, key, { issuer, audience, algorithms: [algorithm] })
				if (typeof payload.sid !== 'string' || typeof payload.sub !== 'string' || typeof payload.name !== 'string') return undefined
				return { sessionId: payload.sid, userId: payload.sub, userName: payload.name }
			} catch {
				return undefined
			}
		},
	}
}

export type SessionTokens = ReturnType<typeof createSessionTokens>
