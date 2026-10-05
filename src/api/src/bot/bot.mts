import { stripMentionsText } from '@microsoft/teams.api'
import { App, ExpressAdapter } from '@microsoft/teams.apps'
import { ConsoleLogger, type LogLevel } from '@microsoft/teams.common'

import { acceptVote } from './accept.mts'
import { cardMessage, userFromActivity, type BotDependencies } from './bot-context.mts'
import { helpCard } from './cards/help-card.mts'
import { voteDialogId } from './cards/vote-card.mts'
import { describeError } from './describe-error.mts'
import { parseMentionCommand } from './mention-command.mts'
import { createRecentInstalls } from './recent-installs.mts'
import { openStartDialog, startDialogTask } from './start-dialog.mts'
import { isFromStartDialog, NotInConversationError, readStartSubmission, startSession, startSessionAfterInstall } from './start-session.mts'
import { openVoteDialog, voteDialogTask } from './vote-dialog.mts'

import type { Session } from '../sessions/session.mts'
import type { MessageActivityInput, TaskModuleResponse } from '@microsoft/teams.api'
import type { Express } from 'express'

const installFailedMessage = 'TVote couldn\'t be added to this chat. Try again, or ask your Teams admin whether apps can be added here.'
const notInConversationMessage = 'TVote isn\'t in this chat. Close this, and start the estimate again to add it.'
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

	// "+" under the message box → TVote → Start estimate. Teams asks what to open: the start dialog, or first the
	// install card when TVote isn't in this chat yet. This waits for the bot, so right after a quiet spell it can time out.
	app.on('message.ext.open', async ({ activity, api }) => {
		try {
			return await openStartDialog(
				dependencies.webUrl,
				async () => await api.conversations.getMemberById(activity.conversation.id, activity.from.id),
				message => {
					logger.info(message)
				},
			)
		} catch (error) {
			// Can't tell, so open the dialog anyway: posting the card will say what's wrong if it fails too.
			logger.error(`Could not check whether TVote is in the conversation\n${describeError(error)}`)
			return { task: { type: 'continue', value: startDialogTask(dependencies.webUrl) } }
		}
	})

	// The start dialog submits topic and deck. The install card's button lands here too, once Teams has added the bot,
	// without any of ours in it: that one gets the start dialog.
	app.on('message.ext.submit', async context => {
		const { activity } = context
		if (!isFromStartDialog(activity.value.data)) {
			logger.info('TVote was added to the conversation, opening the start dialog')
			return { task: { type: 'continue', value: startDialogTask(dependencies.webUrl) } }
		}

		const submission = readStartSubmission(activity.value.data)
		if (typeof submission === 'string') return { task: { type: 'message', value: submission } }

		const admin = userFromActivity(activity.from)
		const conversationId = activity.conversation.id
		// Teams can refuse the card for a moment after adding the bot, so a start right after an install gets retries.
		const justInstalled = recentInstalls.has(conversationId)
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
			logger.warn(`Not allowed to post the vote card${justInstalled ? ', right after TVote was added' : ''}\n${describeError(error.cause)}`)
			return { task: { type: 'message', value: justInstalled ? installFailedMessage : notInConversationMessage } }
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
