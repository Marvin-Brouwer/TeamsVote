import { describe, expect, it } from 'vitest'

import { openStartDialog } from '../src/bot/start-dialog.mts'

const webUrl = 'https://tvote.example.com'

// What the Teams SDK throws when Teams answers with an error: an axios error carrying the response.
function responseError(status: number): Error {
	return Object.assign(new Error(`Request failed with status code ${status}`), { response: { status } })
}

describe('opening the start dialog', () => {
	it('opens the start page when TVote is in the conversation', async () => {
		const response = await openStartDialog(webUrl, () => Promise.resolve({ id: 'user' }))

		expect(response.task).toMatchObject({ type: 'continue', value: { url: `${webUrl}/teams/start/` } })
	})

	it('shows the install card when Teams says TVote is not in the conversation', async () => {
		const response = await openStartDialog(webUrl, () => Promise.reject(responseError(403)))

		expect(response.task).toMatchObject({
			type: 'continue',
			value: {
				card: {
					contentType: 'application/vnd.microsoft.card.adaptive',
					content: {
						actions: [
							{
								data: {
									msteams: {
										justInTimeInstall: true,
									},
								},
							},
						],
					},
				},
			},
		})
	})

	it('passes any other failure on', async () => {
		const failure = responseError(500)

		await expect(openStartDialog(webUrl, () => Promise.reject(failure))).rejects.toBe(failure)
	})
})
