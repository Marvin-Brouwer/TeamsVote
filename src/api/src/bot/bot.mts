import { App, ExpressAdapter } from '@microsoft/teams.apps'
import { ConsoleLogger, type LogLevel } from '@microsoft/teams.common'

import { cardMessage, userFromActivity, type BotDependencies } from './bot-context.mts'
import { handleCardAction } from './card-actions.mts'
import { startCard, startDialogId } from './cards/start-card.mts'
import { startFormAction } from './cards/start-form.mts'
import { describeError } from './describe-error.mts'
import { openStartForm, readStartForm, startSession } from './start.mts'

import type { AdaptiveCardActionResponse } from '@microsoft/teams.api'
import type { Express } from 'express'

const postFailedMessage = 'The vote card couldn\'t be posted. Please try again.'

/**
 * The Teams bot. Registers `/api/messages` on the given Express app.
 * Its identity comes from `CLIENT_ID`, `TENANT_ID` and `MANAGED_IDENTITY_CLIENT_ID`, which the Teams SDK reads itself.
 *
 * Everything happens in cards: the start card opens the start form, the form posts the vote card,
 * and the vote card's buttons come back here as card actions.
 */
export async function createBot(server: Express, dependencies: BotDependencies, logLevel: LogLevel): Promise<App> {
	const logger = new ConsoleLogger('t-vote', { level: logLevel })
	const app = new App({
		logger,
		httpServerAdapter: new ExpressAdapter(server, { logger }),
	})

	// What came in, whether it got an answer and how long that took. No names or ids, see doc/privacy-policy.md.
	// At LOG_LEVEL=info this shows which step Teams gave up on, when all it says is that it can't reach the app.
	app.use(async ({ activity, next }) => {
		const label = activity.type === 'invoke' ? `invoke ${activity.name}` : activity.type
		const started = performance.now()
		const elapsed = () => `${String(Math.round(performance.now() - started))}ms`
		try {
			const response = await next()
			logger.info(`${label}: ${response === undefined ? 'no answer' : 'answered'} in ${elapsed()}`)
			return response
		} catch (error) {
			logger.info(`${label}: failed after ${elapsed()}`)
			throw error
		}
	})

	// TVote was added to a meeting, chat or someone's own chat with it: say what it does.
	app.on('install.add', async context => {
		await context.send(cardMessage(startCard()))
		logger.info('Added to a conversation, posted the start card')
	})

	// Anything sent to TVote gets the start card again. In meetings and group chats it only hears messages that mention it.
	app.on('message', async context => {
		await context.send(cardMessage(startCard()))
	})

	app.on(`dialog.open.${startDialogId}`, () => openStartForm())

	app.on(`dialog.submit.${startFormAction}`, async context => {
		const { activity } = context
		const form = readStartForm(activity.value.data)
		if ('problem' in form) return openStartForm(form)

		try {
			await startSession(dependencies, {
				...form,
				admin: userFromActivity(activity.from),
				conversationId: activity.conversation.id,
				send: async message => await context.send(message),
			})
		} catch (error) {
			logger.error(`Could not post a vote card\n${describeError(error)}`)
			return { task: { type: 'message', value: postFailedMessage } }
		}

		logger.info('Posted a vote card')
		// No answer closes the dialog. The vote card is in the chat now.
		return undefined
	})

	app.on('card.action', async ({ activity, api }): Promise<AdaptiveCardActionResponse> => {
		const outcome = handleCardAction(dependencies.sessions, userFromActivity(activity.from), activity.value.action.data)

		const at = outcome.at ?? (activity.replyToId ? { conversationId: activity.conversation.id, activityId: activity.replyToId } : undefined)
		if (outcome.shared && at) {
			// Everyone else's view follows from this: Teams refreshes it for them.
			await api.conversations.updateActivity(at.conversationId, at.activityId, cardMessage(outcome.shared))
				.catch((error: unknown) => {
					logger.error(`Could not update the vote card for everyone\n${describeError(error)}`)
				})
		}

		return typeof outcome.reply === 'string'
			? { statusCode: 200, type: 'application/vnd.microsoft.activity.message', value: outcome.reply }
			: { statusCode: 200, type: 'application/vnd.microsoft.card.adaptive', value: outcome.reply }
	})

	app.event('error', ({ error }) => {
		logger.error(`Unhandled bot error\n${describeError(error)}`)
	})

	await app.initialize()
	return app
}
