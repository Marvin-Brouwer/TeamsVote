import type { IAdaptiveCard } from '@microsoft/teams.cards'

/**
 * Replaces a vote card whose session is gone: it expired, or the server restarted.
 * The topic isn't known any more at that point, so the card can't repeat it.
 */
export function expiredCard(): IAdaptiveCard {
	return {
		type: 'AdaptiveCard',
		version: '1.5',
		body: [
			{ type: 'TextBlock', text: 'Estimate', size: 'Small', isSubtle: true, spacing: 'None' },
			{ type: 'TextBlock', text: 'This vote ended without a result.', weight: 'Bolder', wrap: true, spacing: 'None' },
			{ type: 'TextBlock', text: 'Votes are only kept for a while. Start a new one to estimate again.', isSubtle: true, wrap: true },
		],
	}
}
