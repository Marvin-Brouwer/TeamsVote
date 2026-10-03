import type { StartSubmission } from '../../contracts/requests.mts'
import type { IAdaptiveCard } from '@microsoft/teams.cards'

/**
 * What the install button submits: the start dialog's topic and deck, plus the flag that makes Teams add the bot first.
 * Teams then sends the whole thing to the bot again, as a new message extension submit.
 */
export type InstallButtonData = Pick<StartSubmission, 'topic' | 'deck'> & {
	readonly msteams: { readonly justInTimeInstall: true }
}

/**
 * Shown in the start dialog when TVote isn't in the chat yet, so it can't post the vote card there.
 * One click adds it and starts the estimate that was just filled in.
 */
export function installCard(submission: Pick<StartSubmission, 'topic' | 'deck'>): IAdaptiveCard {
	const data: InstallButtonData = {
		topic: submission.topic,
		deck: submission.deck,
		msteams: { justInTimeInstall: true },
	}

	return {
		type: 'AdaptiveCard',
		version: '1.5',
		body: [
			{ type: 'TextBlock', text: 'TVote isn\'t in this chat yet', weight: 'Bolder', wrap: true },
			{ type: 'TextBlock', text: 'Add it to this chat, and it posts the vote card for everyone here.', isSubtle: true, wrap: true },
		],
		actions: [
			{ type: 'Action.Submit', title: 'Add TVote and start', style: 'positive', data },
		],
	}
}

/** Whether a message extension submit is Teams coming back after adding the bot through the install card. */
export function isAfterInstall(data: unknown): boolean {
	if (typeof data !== 'object' || data === null || !('msteams' in data)) return false
	const { msteams } = data
	return typeof msteams === 'object' && msteams !== null && 'justInTimeInstall' in msteams && msteams.justInTimeInstall === true
}
