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
			// Teams puts card actions on the right. In a column only as wide as the button, it sits on the left.
			{
				type: 'ColumnSet',
				columns: [
					{
						type: 'Column',
						width: 'auto',
						items: [
							{ type: 'ActionSet', actions: [{ type: 'Action.Submit', title: 'Add TVote', style: 'positive', data }] },
						],
					},
				],
			},
		],
	}
}
