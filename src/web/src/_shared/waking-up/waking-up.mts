import { component } from '@rooted/components'

import styles from './waking-up.css'

// Render's free tier answers in well under a second when it's awake. Longer than this, it's starting up.
const slowAfterMs = 1000

/**
 * A spinner, plus a note when the wait gets long. The API sleeps when nobody uses it,
 * and starting it again takes up to a minute; without the note that looks broken.
 */
export const WakingUp = component({
	name: 'waking-up',
	styles,
	onMount({ append, element, signal }) {
		const note = element('p', {
			classes: styles.note,
			hidden: true,
			textContent: 'Looks like you\'re the first one today, waking things up…',
		})

		append(element('div', {
			classes: styles.root,
			children: [element('fluent-spinner', { size: 'medium' }), note],
		}))

		const timer = setTimeout(() => {
			note.hidden = false
		}, slowAfterMs)
		signal.addEventListener('abort', () => {
			clearTimeout(timer)
		})
	},
})
