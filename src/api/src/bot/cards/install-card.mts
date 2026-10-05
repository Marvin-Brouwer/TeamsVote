import type { IAdaptiveCard } from '@microsoft/teams.cards'

/** What the install button submits. The flag makes Teams add the bot to the chat first, then send the submit to the bot. */
export type InstallButtonData = {
	readonly msteams: { readonly justInTimeInstall: true }
}

/**
 * Shown instead of the start dialog when TVote isn't in the chat yet, because it can't post a vote card there.
 * One click adds it, and the start dialog opens.
 */
export function installCard(): IAdaptiveCard {
	const data: InstallButtonData = { msteams: { justInTimeInstall: true } }

	return {
		type: 'AdaptiveCard',
		version: '1.5',
		body: [
			{ type: 'TextBlock', text: 'TVote isn\'t in this chat yet', weight: 'Bolder', wrap: true },
			{ type: 'TextBlock', text: 'Add it to this chat, and it posts the vote card for everyone here.', isSubtle: true, wrap: true },
		],
		// The button has to be one of the card's own actions, which Teams aligns to the right. Teams only treats the card
		// as an install card when it finds the flag there: anywhere else, it doesn't add the consent text or the bot.
		actions: [
			{ type: 'Action.Submit', title: 'Add TVote', style: 'positive', data },
		],
	}
}
