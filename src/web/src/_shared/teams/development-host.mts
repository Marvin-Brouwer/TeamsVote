import { navigate } from '@rooted/router'

import { apiRequest } from '../api/api-client.mts'

import type { TeamsHost } from './teams-host.mts'
import type { DevelopmentJoinRequest, DevelopmentJoinResponse, DialogSubmission } from '@teams-vote/api/contracts'

/**
 * Development only: plays the part of Teams and the bot, using the API's /dev routes.
 * Pick who you are with `?user=Name`, open the same vote in a second tab as someone else.
 * `?theme=dark` or `?theme=contrast` previews the other Teams themes.
 */
export function developmentHost(): TeamsHost {
	console.info('[TVote] Not inside Teams, using the development host. Add ?user=Name to be someone else.')

	return {
		kind: 'development',
		submit: result => {
			void handleSubmission(result)
		},
	}
}

export function developmentUser(): DevelopmentJoinRequest['user'] {
	const name = new URLSearchParams(window.location.search).get('user') ?? 'Ada'
	return {
		id: `development-${name.toLowerCase()}`,
		name,
	}
}

/** What clicking "Vote" on the card would do: join, and get a token. */
export async function joinAsDevelopmentUser(sessionId: string): Promise<string> {
	const response = await post(`/dev/sessions/${encodeURIComponent(sessionId)}/join`, {
		user: developmentUser(),
	})
	return response.token
}

async function handleSubmission(result: DialogSubmission): Promise<void> {
	switch (result.action) {
		case 'start': {
			const { sessionId, token } = await post('/dev/sessions', {
				topic: result.topic,
				deck: result.deck,
				user: developmentUser(),
			})
			navigate(`/teams/vote/${sessionId}/${window.location.search}#token=${token}`)
			return
		}
		case 'accept':
			await apiRequest(`/dev/sessions/${encodeURIComponent(result.sessionId)}/accept`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user: developmentUser(),
				}),
			})
			console.info('[TVote] Accepted. In Teams the dialog closes now and the card turns into the summary.')
			return
		case 'close':
			console.info('[TVote] In Teams the dialog closes now.')
			return
	}
}

async function post(path: string, body: DevelopmentJoinRequest): Promise<DevelopmentJoinResponse> {
	const response = await apiRequest(path, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	})
	return await response.json() as DevelopmentJoinResponse
}
