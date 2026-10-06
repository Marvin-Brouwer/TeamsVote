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
						textContent: 'In the meeting chat, click Start estimate on TVote\'s card. Send @TVote a message to get that card again.',
					}),
					element('li', {
						textContent: 'Fill in what you\'re estimating. A vote card appears, and everyone clicks their value right on it.',
					}),
					element('li', {
						textContent: 'Whoever started it shows the votes, and the card shows the estimate. They can ask for a re-vote.',
					}),
				],
			}),
		)
	},
})
