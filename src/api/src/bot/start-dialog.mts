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
 * in the conversation. Any other failure is thrown.
 */
export async function openStartDialog(webUrl: string, checkMembership: () => Promise<unknown>): Promise<TaskModuleResponse> {
	try {
		await checkMembership()
	} catch (error) {
		if (!isForbidden(error)) throw error
		return {
			task: {
				type: 'continue',
				value: {
					title: 'Start an estimate',
					card: cardAttachment('adaptive', installCard()),
					// No height: Teams fits the dialog to the card, plus the consent text it adds below the button.
					width: 'medium',
				},
			},
		}
	}

	return { task: { type: 'continue', value: startDialogTask(webUrl) } }
}
