import type { IAdaptiveCard } from '@microsoft/teams.cards'

export const startDialogId = 'start'

/** What "Start estimate" sends. `dialog_id` is how the Teams SDK routes it to `dialog.open.start`. */
export type StartButtonData = {
	readonly msteams: { readonly type: 'task/fetch' }
	readonly dialog_id: typeof startDialogId
}

/** Posted when TVote joins a chat, and again whenever someone sends it a message. The way into every estimate. */
export function startCard(): IAdaptiveCard {
	const data: StartButtonData = {
		msteams: { type: 'task/fetch' },
		dialog_id: startDialogId,
	}

	return {
		type: 'AdaptiveCard',
		version: '1.5',
		body: [
			{ type: 'TextBlock', text: 'TVote', size: 'Large', weight: 'Bolder' },
			{
				type: 'TextBlock',
				text: 'Estimate together, right here in the chat. Start an estimate and everyone picks a card. Nobody sees the votes until whoever started it shows them.',
				wrap: true,
			},
		],
		actions: [
			{ type: 'Action.Submit', title: 'Start estimate', style: 'positive', data },
		],
	}
}
