import { stripMentionsText } from '@microsoft/teams.api'
import { App, ExpressAdapter } from '@microsoft/teams.apps'
import { ConsoleLogger, type LogLevel } from '@microsoft/teams.common'

import { acceptVote } from './accept.mts'
import { cardMessage, userFromActivity, type BotDependencies } from './bot-context.mts'
import { helpCard } from './cards/help-card.mts'
import { voteDialogId } from './cards/vote-card.mts'
import { parseMentionCommand } from './mention-command.mts'
import { NotInConversationError, readStartSubmission, startSession } from './start-session.mts'
import { openVoteDialog, voteDialogTask } from './vote-dialog.mts'

import type { TaskModuleResponse } from '@microsoft/teams.api'
import type { Express } from 'express'

const notInConversationMessage = 'Add TVote to this chat first: open the chat details, go to Apps, and add TVote. Then try again.'

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
			logger.warn('Could not post a vote card after a mention', error.cause)
		}
	})

	// "…" under the message box → TVote → Start estimate. The start page submits topic and deck.
	app.on('message.ext.submit', async context => {
		const { activity } = context
		const submission = readStartSubmission(activity.value.data)
		if (typeof submission === 'string') return { task: { type: 'message', value: submission } }

		const admin = userFromActivity(activity.from)
		try {
			const session = await startSession(dependencies, {
				...submission,
				admin,
				conversationId: activity.conversation.id,
				send: async message => await context.send(message),
			})
			// Take the person who started it straight to their own vote.
			return { task: { type: 'continue', value: await voteDialogTask(dependencies, session, admin) } }
		} catch (error) {
			if (!(error instanceof NotInConversationError)) throw error
			logger.warn('Could not post a vote card from the message extension', error.cause)
			return { task: { type: 'message', value: notInConversationMessage } }
		}
	})

	app.on(`dialog.open.${voteDialogId}`, async ({ activity, api }) => await openVoteDialog(dependencies, { activity, api }))

	app.on('dialog.submit.accept', async ({ activity, api, log }) => await acceptVote(dependencies, { activity, api, log }))

	// A vote dialog closing itself after the session ended. Nothing to do.
	app.on('dialog.submit.close', (): TaskModuleResponse | undefined => undefined)

	app.event('error', ({ error }) => {
		logger.error('Unhandled bot error', error)
	})

	await app.initialize()
	return app
}
