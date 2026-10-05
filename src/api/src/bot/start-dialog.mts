import { cardAttachment, type TaskModuleResponse, type UrlTaskModuleTaskInfo } from '@microsoft/teams.api'

import { installCard } from './cards/install-card.mts'
import { isForbidden } from './start-session.mts'

/** The start dialog itself: a page of the web app, which submits the topic and deck back to the bot. */
export function startDialogTask(webUrl: string): UrlTaskModuleTaskInfo {
	return {
		title: 'Start an estimate',
		url: `${webUrl}/teams/start/`,
		width: 'medium',
		height: 'medium',
	}
}

/**
 * "+" → TVote → Start estimate. Teams asks the bot what to show: the start dialog, or first the install card when
 * TVote isn't in the chat yet. Teams only adds the bot through that card when it's shown here, as the dialog opens.
 *
 * `checkMembership` asks Teams for the person opening the dialog, which it refuses with a 403 when the bot isn't
 * in the conversation. Any other failure is thrown. `log` hears which of the two it opens.
 */
export async function openStartDialog(webUrl: string, checkMembership: () => Promise<unknown>, log: (message: string) => void): Promise<TaskModuleResponse> {
	try {
		await checkMembership()
	} catch (error) {
		if (!isForbidden(error)) throw error
		log('Not in the conversation yet, showing the install card')
		return {
			task: {
				type: 'continue',
				value: {
					title: 'Start an estimate',
					card: cardAttachment('adaptive', installCard()),
					// Microsoft's own install sample always sets a height. 300px fits the card plus the consent text Teams adds below it.
					width: 'medium',
					height: 300,
				},
			},
		}
	}

	log('In the conversation, opening the start dialog')
	return { task: { type: 'continue', value: startDialogTask(webUrl) } }
}
