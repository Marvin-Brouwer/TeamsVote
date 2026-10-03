import { cardAttachment, stripMentionsText } from '@microsoft/teams.api'
import { App, ExpressAdapter } from '@microsoft/teams.apps'
import { ConsoleLogger, type LogLevel } from '@microsoft/teams.common'

import { acceptVote } from './accept.mts'
import { cardMessage, userFromActivity, type BotDependencies } from './bot-context.mts'
import { helpCard } from './cards/help-card.mts'
import { installCard, isAfterInstall } from './cards/install-card.mts'
import { voteDialogId } from './cards/vote-card.mts'
import { describeError } from './describe-error.mts'
import { parseMentionCommand } from './mention-command.mts'
import { createRecentInstalls } from './recent-installs.mts'
import { NotInConversationError, readStartSubmission, startSession, startSessionAfterInstall } from './start-session.mts'
import { openVoteDialog, voteDialogTask } from './vote-dialog.mts'

import type { Session } from '../sessions/session.mts'
import type { MessageActivityInput, TaskModuleResponse } from '@microsoft/teams.api'
import type { Express } from 'express'

const installFailedMessage = 'TVote couldn\'t be added to this chat. Try again, or ask your Teams admin whether apps can be added here.'
const postFailedMessage = 'The vote card couldn\'t be posted. Please try again.'
// About three and a half seconds in all, well within the time Teams waits for an answer.
const retryDelaysAfterInstallMs = [500, 1000, 2000]

/**
 * The Teams bot. Registers `/api/messages` on the given Express app.
 * Credentials come from `CLIENT_ID`, `CLIENT_SECRET` and `TENANT_ID`, which the Teams SDK reads itself.
 */
export async function createBot(server: Express, dependencies: BotDependencies, logLevel: LogLevel): Promise<App> {
	const logger = new ConsoleLogger('t-vote', { level: logLevel })
	const app = new App({
		logger,
		httpServerAdapter: new ExpressAdapter(server, { logger }),
	})

	const recentInstalls = createRecentInstalls({ windowMs: 60_000 })
	app.on('install.add', ({ activity }) => {
		recentInstalls.add(activity.conversation.id)
	})

	// What came in, whether it got an answer and how long that took. No names or ids, see doc/privacy-policy.md.
	// At LOG_LEVEL=info this shows which step Teams gave up on, when all it says is that it can't reach the app.
	app.use(async ({ activity, next }) => {
		const label = activity.type === 'invoke' ? `invoke ${activity.name}` : activity.type
		const started = performance.now()
		const elapsed = () => `${Math.round(performance.now() - started)}ms`
		try {
			const response = await next()
			logger.info(`${label}: ${response === undefined ? 'no answer' : 'answered'} in ${elapsed()}`)
			return response
		} catch (error) {
			logger.info(`${label}: failed after ${elapsed()}`)
			throw error
		}
	})

	// "@TVote PROJ-123 --t-shirt". In group chats the bot only hears messages that mention it.
	app.on('message', async context => {
		const { activity } = context
		const command = parseMentionCommand(stripMentionsText(activity))
		if (command.kind === 'help') {
			await context.send(cardMessage(helpCard(command.problem)))
			return
		}

		try {
			await startSession(dependencies, {
				topic: command.topic,
				deck: command.deck,
				admin: userFromActivity(activity.from),
				conversationId: activity.conversation.id,
				send: async message => await context.send(message),
			})
		} catch (error) {
			if (!(error instanceof NotInConversationError)) throw error
			logger.warn(`Could not post a vote card after a mention\n${describeError(error.cause)}`)
		}
	})

	// "…" under the message box → TVote → Start estimate. The start page submits topic and deck.
	// When TVote isn't in the chat yet, the install card's button submits them again, after Teams has added the bot.
	app.on('message.ext.submit', async context => {
		const { activity } = context
		const submission = readStartSubmission(activity.value.data)
		if (typeof submission === 'string') return { task: { type: 'message', value: submission } }

		const admin = userFromActivity(activity.from)
		const conversationId = activity.conversation.id
		// Teams doesn't always pass the install button's flag back, so the install event counts too.
		const justInstalled = recentInstalls.has(conversationId) || isAfterInstall(activity.value.data)
		const request = {
			...submission,
			admin,
			conversationId,
			send: async (message: MessageActivityInput) => await context.send(message),
		}

		let session: Session
		try {
			session = justInstalled
				? await startSessionAfterInstall(dependencies, request, retryDelaysAfterInstallMs)
				: await startSession(dependencies, request)
		} catch (error) {
			if (!(error instanceof NotInConversationError)) {
				logger.error(`Could not post a vote card from the message extension\n${describeError(error)}`)
				return { task: { type: 'message', value: postFailedMessage } }
			}
			// Never offer the install card twice: Teams won't take it after an install, and shows "can't reach the app".
			if (justInstalled) {
				logger.warn(`Still not allowed to post after TVote was added to the conversation\n${describeError(error.cause)}`)
				return { task: { type: 'message', value: installFailedMessage } }
			}
			logger.info(`Not in the conversation yet, offering the install card\n${describeError(error.cause)}`)
			return {
				task: {
					type: 'continue',
					value: {
						title: 'Start an estimate',
						card: cardAttachment('adaptive', installCard(submission)),
						// No height: Teams fits the dialog to the card, plus the consent text it adds below the button.
						width: 'medium',
					},
				},
			}
		}

		logger.info(justInstalled ? 'Posted the vote card after TVote was added to the conversation' : 'Posted the vote card')
		// Take the person who started it straight to their own vote.
		return { task: { type: 'continue', value: await voteDialogTask(dependencies, session, admin) } }
	})

	app.on(`dialog.open.${voteDialogId}`, async ({ activity, api }) => await openVoteDialog(dependencies, { activity, api }))

	app.on('dialog.submit.accept', async ({ activity, api, log }) => await acceptVote(dependencies, { activity, api, log }))

	// A vote dialog closing itself after the session ended. Nothing to do.
	app.on('dialog.submit.close', (): TaskModuleResponse | undefined => undefined)

	app.event('error', ({ error }) => {
		logger.error(`Unhandled bot error\n${describeError(error)}`)
	})

	await app.initialize()
	return app
}
