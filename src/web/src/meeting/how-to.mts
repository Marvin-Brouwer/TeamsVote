import { component } from '@rooted/components'

import styles from './meeting.css'

/** How an estimate goes in a meeting. The panel and the configuration page both show it. */
export const HowTo = component({
	name: 'meeting-how-to',
	styles,
	onMount({ append, element }) {
		append(
			element('ol', {
				classes: styles.steps,
				children: [
					element('li', {
						textContent: 'In the meeting chat, click + under the message box, then TVote → Start estimate.',
					}),
					element('li', {
						textContent: 'Everyone clicks Vote on the card that appears, and picks a card.',
					}),
					element('li', {
						textContent: 'Whoever started it shows the votes and accepts. The card in the chat turns into the estimate.',
					}),
				],
			}),
		)
	},
})
